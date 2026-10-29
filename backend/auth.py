import jwt
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, g
from config import Config
from database import get_db_connection

def generate_token(user_id, role, email, name):
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "name": name,
        "exp": datetime.now(timezone.utc) + Config.JWT_EXPIRATION_DELTA,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_token_from_header():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None

def get_current_user_from_db(user_id):
    conn = get_db_connection()
    user = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?;", (user_id,)).fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "Authentication token missing or invalid", "authenticated": False}), 401
        
        decoded = decode_token(token)
        if not decoded:
            return jsonify({"error": "Token expired or malformed", "authenticated": False}), 401
            
        user = get_current_user_from_db(decoded.get("user_id"))
        if not user:
            return jsonify({"error": "User account no longer exists", "authenticated": False}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "Authentication required", "authenticated": False}), 401
            
        decoded = decode_token(token)
        if not decoded:
            return jsonify({"error": "Token expired or invalid", "authenticated": False}), 401
            
        user = get_current_user_from_db(decoded.get("user_id"))
        if not user or user.get("role") != "admin":
            return jsonify({"error": "Administrator privileges required", "authorized": False}), 403
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated

def optional_auth():
    """Allows extracting user if token is provided, without blocking unauthenticated requests."""
    token = get_token_from_header()
    if token:
        decoded = decode_token(token)
        if decoded:
            return get_current_user_from_db(decoded.get("user_id"))
    return None
