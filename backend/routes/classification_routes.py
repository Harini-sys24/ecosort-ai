import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, g
from werkzeug.utils import secure_filename
from config import Config
from database import get_db_connection
from auth import require_auth, optional_auth
from ml.cnn_classifier import classifier

classification_bp = Blueprint("classification", __name__)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@classification_bp.route("/classify", methods=["POST"])
def classify_item():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided in the request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename submitted"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type. Allowed formats: {', '.join(Config.ALLOWED_EXTENSIONS)}"
        }), 400

    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Secure unique filename
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    saved_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
    file.save(saved_path)

    # Check for optional demo_hint (for interactive demo testing when no model weights are trained)
    demo_hint = request.form.get("demo_hint", "").strip() or None

    # Perform CNN classification
    result = classifier.classify(saved_path, demo_hint=demo_hint)
    
    # Attach image URL for client rendering
    result["image_url"] = f"/api/uploads/{unique_name}"
    result["image_filename"] = unique_name

    # Fetch associated disposal guidance and category metadata
    category_slug = result.get("category_slug")
    guidance_data = None
    if category_slug:
        conn = get_db_connection()
        guidance = conn.execute("""
            SELECT g.*, c.name as category_name, c.hazard_level, c.key_materials, c.recyclability_rate
            FROM disposal_guidance g
            JOIN categories c ON g.category_id = c.id
            WHERE g.category_slug = ?;
        """, (category_slug,)).fetchone()
        conn.close()
        
        if guidance:
            item = dict(guidance)
            if item.get("dos"):
                item["dos_list"] = [d.strip() for d in item["dos"].split(";") if d.strip()]
            if item.get("donts"):
                item["donts_list"] = [d.strip() for d in item["donts"].split(";") if d.strip()]
            guidance_data = item

    # Check if a logged-in user made the request -> persist to history automatically
    current_user = optional_auth()
    history_id = None
    if current_user:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO classification_history (
                    user_id, category_slug, category_name, confidence,
                    image_filename, is_demo_mode, model_status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                current_user["id"],
                result.get("category_slug"),
                result.get("category_name"),
                result.get("confidence"), # None if demo/untrained
                unique_name,
                1 if not result.get("is_trained") else 0,
                result.get("model_status"),
                f"Classified at {result.get('inference_time_ms')} ms"
            ))
            history_id = cursor.lastrowid
            conn.commit()
            conn.close()
            result["history_id"] = history_id
            result["saved_to_history"] = True
        except Exception as e:
            result["saved_to_history"] = False
            result["history_save_error"] = str(e)
    else:
        result["saved_to_history"] = False
        result["history_notice"] = "Guest session: result not saved to persistent history. Log in to track past scans."

    return jsonify({
        "classification": result,
        "guidance": guidance_data
    }), 200

@classification_bp.route("/uploads/<filename>", methods=["GET"])
def get_uploaded_image(filename):
    safe_name = secure_filename(filename)
    return send_from_directory(Config.UPLOAD_FOLDER, safe_name)

@classification_bp.route("/history", methods=["GET"])
@require_auth
def get_user_history():
    user_id = g.current_user["id"]
    conn = get_db_connection()
    history_rows = conn.execute("""
        SELECT h.*, c.hazard_level, c.recyclability_rate
        FROM classification_history h
        LEFT JOIN categories c ON h.category_slug = c.slug
        WHERE h.user_id = ?
        ORDER BY h.created_at DESC;
    """, (user_id,)).fetchall()
    conn.close()

    items = []
    for row in history_rows:
        item = dict(row)
        if item.get("image_filename"):
            item["image_url"] = f"/api/uploads/{item['image_filename']}"
        items.append(item)

    return jsonify({"history": items, "count": len(items)}), 200

@classification_bp.route("/history", methods=["POST"])
@require_auth
def save_to_history():
    user_id = g.current_user["id"]
    data = request.get_json() or {}
    
    category_slug = data.get("category_slug")
    category_name = data.get("category_name")
    confidence = data.get("confidence")
    image_filename = data.get("image_filename")
    is_demo_mode = data.get("is_demo_mode", 0)
    notes = data.get("notes", "Saved from Results Hub")

    if not category_slug or not category_name:
        return jsonify({"error": "Category slug and name are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO classification_history (
            user_id, category_slug, category_name, confidence,
            image_filename, is_demo_mode, model_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id, category_slug, category_name, confidence,
        image_filename, 1 if is_demo_mode else 0,
        "demo" if is_demo_mode else "active", notes
    ))
    history_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Classification saved to your history successfully",
        "history_id": history_id
    }), 201

@classification_bp.route("/history/<int:history_id>", methods=["DELETE"])
@require_auth
def delete_history_item(history_id):
    user_id = g.current_user["id"]
    conn = get_db_connection()
    
    # Check ownership
    item = conn.execute("SELECT id, image_filename FROM classification_history WHERE id = ? AND user_id = ?;", (history_id, user_id)).fetchone()
    if not item:
        conn.close()
        return jsonify({"error": "History record not found or unauthorized"}), 404

    conn.execute("DELETE FROM classification_history WHERE id = ?;", (history_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "History entry deleted successfully"}), 200
