import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.content_routes import content_bp
from routes.classification_routes import classification_bp
from routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Upload and Model Directories
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.MODELS_DIR, exist_ok=True)

    # Enable Cross-Origin Resource Sharing
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize database on startup
    with app.app_context():
        init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(content_bp, url_prefix="/api")
    app.register_blueprint(classification_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # System Health & Info
    @app.route("/api/health", methods=["GET"])
    def health_check():
        from ml.cnn_classifier import classifier
        return jsonify({
            "status": "healthy",
            "project": "EcoSort AI",
            "research_title": "The Environmental Cost of Our Digital Life: A Smart Approach to E-Waste Management Using Machine Learning",
            "version": "1.0.0",
            "model_status": "active" if classifier.is_loaded else "demo_mode",
            "is_trained": classifier.is_loaded
        }), 200

    # Error Handlers
    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({
            "error": "File size exceeds the 10MB limit. Please upload an image under 10MB."
        }), 413

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Requested endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Internal server error occurred"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"EcoSort AI Backend starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
