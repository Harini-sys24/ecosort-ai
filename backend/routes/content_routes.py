from flask import Blueprint, request, jsonify
from database import get_db_connection

content_bp = Blueprint("content", __name__)

@content_bp.route("/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    categories = conn.execute("""
        SELECT c.*, g.handling_instructions, g.environmental_risks, g.safety_protocols, g.recycling_advice, g.dos, g.donts
        FROM categories c
        LEFT JOIN disposal_guidance g ON c.id = g.category_id
        ORDER BY c.id ASC;
    """).fetchall()
    conn.close()
    
    result = []
    for row in categories:
        item = dict(row)
        # Parse dos and donts into lists
        if item.get("dos"):
            item["dos_list"] = [d.strip() for d in item["dos"].split(";") if d.strip()]
        if item.get("donts"):
            item["donts_list"] = [d.strip() for d in item["donts"].split(";") if d.strip()]
        result.append(item)
        
    return jsonify({"categories": result}), 200

@content_bp.route("/categories/<slug>", methods=["GET"])
def get_category_by_slug(slug):
    conn = get_db_connection()
    category = conn.execute("""
        SELECT c.*, g.handling_instructions, g.environmental_risks, g.safety_protocols, g.recycling_advice, g.dos, g.donts
        FROM categories c
        LEFT JOIN disposal_guidance g ON c.id = g.category_id
        WHERE c.slug = ?;
    """, (slug,)).fetchone()
    conn.close()

    if not category:
        return jsonify({"error": f"Category '{slug}' not found"}), 404

    item = dict(category)
    if item.get("dos"):
        item["dos_list"] = [d.strip() for d in item["dos"].split(";") if d.strip()]
    if item.get("donts"):
        item["donts_list"] = [d.strip() for d in item["donts"].split(";") if d.strip()]
        
    return jsonify({"category": item}), 200

@content_bp.route("/guidance/<slug>", methods=["GET"])
def get_guidance(slug):
    conn = get_db_connection()
    guidance = conn.execute("""
        SELECT g.*, c.name as category_name, c.hazard_level, c.key_materials, c.recyclability_rate
        FROM disposal_guidance g
        JOIN categories c ON g.category_id = c.id
        WHERE g.category_slug = ?;
    """, (slug,)).fetchone()
    conn.close()

    if not guidance:
        return jsonify({"error": f"Disposal guidance for '{slug}' not found"}), 404

    item = dict(guidance)
    if item.get("dos"):
        item["dos_list"] = [d.strip() for d in item["dos"].split(";") if d.strip()]
    if item.get("donts"):
        item["donts_list"] = [d.strip() for d in item["donts"].split(";") if d.strip()]

    return jsonify({"guidance": item}), 200

@content_bp.route("/centres", methods=["GET"])
def get_collection_centres():
    query_param = request.args.get("q", "").strip()
    city_param = request.args.get("city", "").strip()
    pin_param = request.args.get("pin", "").strip()

    conn = get_db_connection()
    sql = "SELECT * FROM collection_centres WHERE 1=1"
    params = []

    if pin_param:
        sql += " AND pin_code LIKE ?"
        params.append(f"%{pin_param}%")
    if city_param:
        sql += " AND LOWER(city) = LOWER(?)"
        params.append(city_param)
    if query_param:
        sql += " AND (name LIKE ? OR address LIKE ? OR city LIKE ? OR pin_code LIKE ? OR accepted_items LIKE ?)"
        wildcard = f"%{query_param}%"
        params.extend([wildcard, wildcard, wildcard, wildcard, wildcard])

    sql += " ORDER BY city ASC, name ASC;"
    centres = conn.execute(sql, params).fetchall()
    
    # Also fetch list of unique cities for filtering
    cities = [r[0] for r in conn.execute("SELECT DISTINCT city FROM collection_centres ORDER BY city ASC;").fetchall()]
    conn.close()

    result = [dict(c) for c in centres]
    return jsonify({
        "centres": result,
        "total": len(result),
        "available_cities": cities,
        "is_demo_notice": "Collection centre locations are verified demo records for research and evaluation purposes."
    }), 200

@content_bp.route("/centres/<int:centre_id>", methods=["GET"])
def get_centre_details(centre_id):
    conn = get_db_connection()
    centre = conn.execute("SELECT * FROM collection_centres WHERE id = ?;", (centre_id,)).fetchone()
    conn.close()

    if not centre:
        return jsonify({"error": "Collection centre not found"}), 404

    return jsonify({"centre": dict(centre)}), 200
