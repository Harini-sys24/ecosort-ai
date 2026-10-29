import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("ECOSORT_SECRET_KEY", "ecosort-ai-cse-research-secret-key-2026")
    JWT_SECRET_KEY = os.environ.get("ECOSORT_JWT_SECRET", "ecosort-jwt-super-secret-key-2026")
    JWT_EXPIRATION_DELTA = timedelta(days=7)
    
    # SQLite Database
    DATABASE_PATH = os.path.join(BASE_DIR, "ewaste.db")
    
    # File Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    
    # Machine Learning Models
    MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
    DEFAULT_MODEL_NAME = "ecosort_cnn.keras"
    EVALUATION_METRICS_PATH = os.path.join(BASE_DIR, "ml", "sample_eval_metrics.json")
    
    # CORS Origin
    CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
