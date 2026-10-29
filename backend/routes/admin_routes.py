import json
import os
from flask import Blueprint, request, jsonify
from database import get_db_connection
from auth import require_admin
from config import Config

admin_bp = Blueprint("admin", __name__)

# =========================================================================
# 1. OVERVIEW & ANALYTICS
# =========================================================================
@admin_bp.route("/overview", methods=["GET"])
@require_admin
def get_admin_overview():
    conn = get_db_connection()
    
    # Counts
    total_users = conn.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
    total_classifications = conn.execute("SELECT COUNT(*) FROM classification_history;").fetchone()[0]
    total_categories = conn.execute("SELECT COUNT(*) FROM categories;").fetchone()[0]
    total_centres = conn.execute("SELECT COUNT(*) FROM collection_centres;").fetchone()[0]
    
    # Classifications per Category
    category_counts_raw = conn.execute("""
        SELECT c.slug, c.name, COUNT(h.id) as count
        FROM categories c
        LEFT JOIN classification_history h ON c.slug = h.category_slug
        GROUP BY c.slug, c.name
        ORDER BY count DESC;
    """).fetchall()
    category_stats = [dict(row) for row in category_counts_raw]

    # Recent Classifications Activity
    recent_activity_raw = conn.execute("""
        SELECT h.id, h.category_name, h.confidence, h.is_demo_mode, h.created_at, u.name as user_name, u.email as user_email
        FROM classification_history h
        LEFT JOIN users u ON h.user_id = u.id
        ORDER BY h.created_at DESC
        LIMIT 10;
    """).fetchall()
    recent_activity = [dict(row) for row in recent_activity_raw]

    # Recent Users
    recent_users_raw = conn.execute("""
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5;
    """).fetchall()
    recent_users = [dict(row) for row in recent_users_raw]

    conn.close()

    return jsonify({
        "stats": {
            "total_users": total_users,
            "total_classifications": total_classifications,
            "total_categories": total_categories,
            "total_centres": total_centres
        },
        "category_distribution": category_stats,
        "recent_activity": recent_activity,
        "recent_users": recent_users
    }), 200

# =========================================================================
# 2. MANAGE CATEGORIES & GUIDANCE
# =========================================================================
@admin_bp.route("/categories", methods=["POST"])
@require_admin
def add_category():
    data = request.get_json() or {}
    slug = data.get("slug", "").strip().lower().replace(" ", "_")
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    hazard_level = data.get("hazard_level", "Moderate")
    key_materials = data.get("key_materials", "").strip()
    recyclability_rate = int(data.get("recyclability_rate", 80))

    if not slug or not name:
        return jsonify({"error": "Category slug and name are required"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO categories (slug, name, description, hazard_level, key_materials, recyclability_rate)
            VALUES (?, ?, ?, ?, ?, ?);
        """, (slug, name, description, hazard_level, key_materials, recyclability_rate))
        category_id = cursor.lastrowid

        # Insert placeholder guidance if not provided
        cursor.execute("""
            INSERT INTO disposal_guidance (
                category_id, category_slug, handling_instructions, environmental_risks,
                safety_protocols, recycling_advice, dos, donts
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            category_id, slug,
            data.get("handling_instructions", "Handle with care and isolate before recycling."),
            data.get("environmental_risks", "Contains electronic materials that must not enter landfills."),
            data.get("safety_protocols", "Wear gloves and do not tamper with electrical parts."),
            data.get("recycling_advice", "Drop off at state-authorized e-waste collection points."),
            data.get("dos", "Package safely; Hand to certified handlers."),
            data.get("donts", "Do not discard in household trash; Do not burn.")
        ))
        conn.commit()
        conn.close()
        return jsonify({"message": "Category added successfully", "id": category_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Failed to add category: {str(e)}"}), 400

@admin_bp.route("/categories/<int:category_id>", methods=["PUT"])
@require_admin
def update_category(category_id):
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    hazard_level = data.get("hazard_level", "Moderate")
    key_materials = data.get("key_materials", "").strip()
    recyclability_rate = int(data.get("recyclability_rate", 80))

    conn = get_db_connection()
    conn.execute("""
        UPDATE categories
        SET name = ?, description = ?, hazard_level = ?, key_materials = ?, recyclability_rate = ?
        WHERE id = ?;
    """, (name, description, hazard_level, key_materials, recyclability_rate, category_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category updated successfully"}), 200

@admin_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@require_admin
def delete_category(category_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM categories WHERE id = ?;", (category_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Category deleted successfully"}), 200

@admin_bp.route("/guidance/<slug>", methods=["PUT"])
@require_admin
def update_guidance(slug):
    data = request.get_json() or {}
    handling = data.get("handling_instructions", "").strip()
    risks = data.get("environmental_risks", "").strip()
    safety = data.get("safety_protocols", "").strip()
    advice = data.get("recycling_advice", "").strip()
    dos = data.get("dos", "").strip()
    donts = data.get("donts", "").strip()

    conn = get_db_connection()
    conn.execute("""
        UPDATE disposal_guidance
        SET handling_instructions = ?, environmental_risks = ?, safety_protocols = ?,
            recycling_advice = ?, dos = ?, donts = ?, updated_at = CURRENT_TIMESTAMP
        WHERE category_slug = ?;
    """, (handling, risks, safety, advice, dos, donts, slug))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Disposal guidance for '{slug}' updated successfully"}), 200

# =========================================================================
# 3. MANAGE COLLECTION CENTRES
# =========================================================================
@admin_bp.route("/centres", methods=["POST"])
@require_admin
def add_centre():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    address = data.get("address", "").strip()
    city = data.get("city", "").strip()
    state = data.get("state", "").strip()
    pin_code = data.get("pin_code", "").strip()
    phone = data.get("contact_phone", "").strip()
    email = data.get("contact_email", "").strip()
    hours = data.get("operating_hours", "Mon - Sat: 9:00 AM - 6:00 PM").strip()
    items = data.get("accepted_items", "").strip()
    lat = float(data.get("latitude", 0.0) or 0.0)
    lng = float(data.get("longitude", 0.0) or 0.0)
    is_demo = 1 if data.get("is_demo", True) else 0

    if not name or not address or not city or not pin_code:
        return jsonify({"error": "Centre name, address, city, and PIN code are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO collection_centres (
            name, address, city, state, pin_code, contact_phone, contact_email,
            operating_hours, accepted_items, latitude, longitude, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (name, address, city, state, pin_code, phone, email, hours, items, lat, lng, is_demo))
    centre_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"message": "Collection centre registered successfully", "id": centre_id}), 201

@admin_bp.route("/centres/<int:centre_id>", methods=["PUT"])
@require_admin
def update_centre(centre_id):
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    address = data.get("address", "").strip()
    city = data.get("city", "").strip()
    state = data.get("state", "").strip()
    pin_code = data.get("pin_code", "").strip()
    phone = data.get("contact_phone", "").strip()
    email = data.get("contact_email", "").strip()
    hours = data.get("operating_hours", "").strip()
    items = data.get("accepted_items", "").strip()
    lat = float(data.get("latitude", 0.0) or 0.0)
    lng = float(data.get("longitude", 0.0) or 0.0)
    is_demo = 1 if data.get("is_demo", True) else 0

    conn = get_db_connection()
    conn.execute("""
        UPDATE collection_centres
        SET name = ?, address = ?, city = ?, state = ?, pin_code = ?,
            contact_phone = ?, contact_email = ?, operating_hours = ?,
            accepted_items = ?, latitude = ?, longitude = ?, is_demo = ?
        WHERE id = ?;
    """, (name, address, city, state, pin_code, phone, email, hours, items, lat, lng, is_demo, centre_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Collection centre updated successfully"}), 200

@admin_bp.route("/centres/<int:centre_id>", methods=["DELETE"])
@require_admin
def delete_centre(centre_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM collection_centres WHERE id = ?;", (centre_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Collection centre removed successfully"}), 200

# =========================================================================
# 4. MODEL PERFORMANCE & METRICS
# =========================================================================
@admin_bp.route("/model-metrics", methods=["GET"])
@require_admin
def get_model_metrics():
    conn = get_db_connection()
    evaluation = conn.execute("""
        SELECT * FROM model_evaluations
        WHERE is_active = 1
        ORDER BY evaluated_at DESC
        LIMIT 1;
    """).fetchone()
    conn.close()

    if evaluation:
        item = dict(evaluation)
        # Parse JSON fields
        try:
            item["confusion_matrix"] = json.loads(item["confusion_matrix_json"])
        except Exception:
            item["confusion_matrix"] = []
        try:
            item["per_class_metrics"] = json.loads(item["class_metrics_json"])
        except Exception:
            item["per_class_metrics"] = {}
        return jsonify({"metrics": item, "source": "database"}), 200

    # Fallback to sample_eval_metrics.json file if database record doesn't exist
    if os.path.exists(Config.EVALUATION_METRICS_PATH):
        with open(Config.EVALUATION_METRICS_PATH, "r") as f:
            data = json.load(f)
            return jsonify({"metrics": data, "source": "file_benchmark"}), 200

    return jsonify({"error": "No model performance evaluation records found"}), 404

@admin_bp.route("/reload-model", methods=["POST"])
@require_admin
def reload_model_endpoint():
    from ml.cnn_classifier import classifier
    is_loaded = classifier.reload_model()
    return jsonify({
        "success": True,
        "is_loaded": is_loaded,
        "model_status": "active" if is_loaded else "demo_mode",
        "message": "Model reloaded successfully." if is_loaded else "No trained model weights found in backend/ml/models/."
    }), 200

