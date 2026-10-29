import os
import time
import numpy as np
from PIL import Image
from config import Config

# The 6 E-Waste classes for CSE Research Project
CATEGORIES = [
    {"slug": "mobile_phones", "name": "Mobile Phones & Smartphones", "index": 0},
    {"slug": "laptops", "name": "Laptops & Notebooks", "index": 1},
    {"slug": "keyboards", "name": "Keyboards & Peripherals", "index": 2},
    {"slug": "circuit_boards", "name": "Printed Circuit Boards (PCBs)", "index": 3},
    {"slug": "batteries", "name": "Lithium-ion & Rechargeable Batteries", "index": 4},
    {"slug": "chargers_cables", "name": "Chargers, Adapters & Cables", "index": 5}
]

SLUG_MAP = {c["slug"]: c for c in CATEGORIES}
INDEX_MAP = {c["index"]: c for c in CATEGORIES}

class EWasteClassifier:
    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.model_path = None
        self.tf_available = False
        self._init_model()

    def _init_model(self):
        # Look for model file in models directory
        possible_paths = [
            os.path.join(Config.MODELS_DIR, "ecosort_cnn.keras"),
            os.path.join(Config.MODELS_DIR, "ecosort_cnn.h5"),
            os.path.join(Config.MODELS_DIR, "best_model.keras")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                self.model_path = path
                break
                
        try:
            import tensorflow as tf
            self.tf_available = True
            if self.model_path and os.path.exists(self.model_path):
                print(f"Loading trained model from {self.model_path}...")
                self.model = tf.keras.models.load_model(self.model_path)
                self.is_loaded = True
                print("Trained CNN model loaded successfully.")
            else:
                print("No pre-trained model file found. Running in Explicit Demo / Untrained Mode.")
        except ImportError:
            self.tf_available = False
            print("TensorFlow not installed in current environment. Running in Explicit Demo / Untrained Mode.")

    def reload_model(self):
        """Reloads the model from disk if a new weights file was trained or placed."""
        self.model = None
        self.is_loaded = False
        self.model_path = None
        self._init_model()
        return self.is_loaded

    def preprocess_image(self, image_path, target_size=(224, 224)):
        """Preprocesses image for CNN inference: resize, convert to RGB, normalize to [0, 1]."""
        img = Image.open(image_path).convert("RGB")
        img = img.resize(target_size, Image.Resampling.BILINEAR)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)

    def classify(self, image_path, demo_hint=None):
        """
        Classifies an e-waste image.
        If a trained model is present, returns real prediction and actual confidence.
        If no trained model is present, returns explicit 'Demo mode / Model not trained' status.
        Never invents predictions or confidence scores.
        """
        # If not currently loaded, check if a newly trained model has been placed in models directory
        if not self.is_loaded:
            self._init_model()

        start_time = time.time()
        
        # Scenario 1: Real Trained Model is available
        if self.is_loaded and self.model is not None:
            try:
                processed_img = self.preprocess_image(image_path)
                raw_preds = self.model.predict(processed_img, verbose=0)[0]
                pred_index = int(np.argmax(raw_preds))
                confidence = float(raw_preds[pred_index])
                inference_time_ms = round((time.time() - start_time) * 1000, 2)
                
                cat_info = INDEX_MAP.get(pred_index, CATEGORIES[0])
                all_probs = {
                    INDEX_MAP[i]["slug"]: round(float(raw_preds[i]), 4)
                    for i in range(len(CATEGORIES))
                }
                
                return {
                    "status": "success",
                    "model_status": "active",
                    "is_trained": True,
                    "category_slug": cat_info["slug"],
                    "category_name": cat_info["name"],
                    "confidence": round(confidence, 4),
                    "confidence_percentage": f"{round(confidence * 100, 1)}%",
                    "inference_time_ms": inference_time_ms,
                    "all_probabilities": all_probs,
                    "message": "Item successfully classified by trained Deep CNN model."
                }
            except Exception as e:
                return {
                    "status": "error",
                    "model_status": "error",
                    "is_trained": True,
                    "message": f"Error running CNN model inference: {str(e)}",
                    "category_slug": None,
                    "category_name": None,
                    "confidence": None
                }
                
        # Scenario 2: No trained model exists -> Explicit Demo / Model Not Trained Mode
        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        
        # If demo_hint is provided by testing UI, we honor it transparently without fake confidence
        selected_category = None
        if demo_hint and demo_hint in SLUG_MAP:
            selected_category = SLUG_MAP[demo_hint]
        else:
            # Simple content-neutral fallback based on file hash or default preview
            # But clearly stated as unclassified/demo
            selected_category = CATEGORIES[0]

        return {
            "status": "demo_mode",
            "model_status": "not_trained",
            "is_trained": False,
            "category_slug": selected_category["slug"],
            "category_name": selected_category["name"],
            "confidence": None, # Stated explicitly as None - NEVER invent fake confidence
            "confidence_display": "Unmeasured (Demo Mode)",
            "inference_time_ms": inference_time_ms,
            "message": "Demo Mode: No trained TensorFlow/Keras model detected in backend/ml/models/. Predictions and confidence are unmeasured.",
            "instructions": (
                "To train and deploy a real model: "
                "1. Place your e-waste images inside `dataset/<category_slug>/` "
                "2. Run `python backend/ml/train.py --dataset_dir dataset/` "
                "3. The trained `ecosort_cnn.keras` will be saved to `backend/ml/models/` and loaded automatically."
            )
        }

# Global singleton classifier instance
classifier = EWasteClassifier()
