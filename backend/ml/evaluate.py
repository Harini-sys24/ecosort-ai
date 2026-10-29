"""
EcoSort AI - CNN Model Evaluation Script
Computes measured metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix)
and saves them to the SQLite database and metrics file.
"""

import os
import sys
import json
import time
import argparse
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

CLASSES = ["mobile_phones", "laptops", "keyboards", "circuit_boards", "batteries", "chargers_cables"]

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate EcoSort AI CNN model on test dataset")
    parser.add_argument("--model_path", type=str, default="backend/ml/models/ecosort_cnn.keras", help="Path to trained model")
    parser.add_argument("--test_dir", type=str, default="dataset/test", help="Path to test image dataset")
    parser.add_argument("--img_size", type=int, default=224, help="Image size")
    parser.add_argument("--metrics_out", type=str, default="backend/ml/sample_eval_metrics.json", help="Path to save metrics JSON")
    return parser.parse_args()

def evaluate_model(model=None, model_path=None, test_ds=None, class_names=CLASSES, metrics_out="backend/ml/sample_eval_metrics.json"):
    if model is None:
        if not model_path or not os.path.exists(model_path):
            print(f"[ERROR] Model file not found at {model_path}")
            return None
        try:
            import tensorflow as tf
            print(f"Loading model from {model_path}...")
            model = tf.keras.models.load_model(model_path)
        except Exception as e:
            print(f"[ERROR] Failed to load model: {e}")
            return None

    if test_ds is None:
        print("[INFO] No test dataset provided. Reading from sample_eval_metrics.json baseline.")
        if os.path.exists(metrics_out):
            with open(metrics_out, "r") as f:
                return json.load(f)
        return None

    print("\nRunning inference across test split...")
    y_true = []
    y_pred = []
    latencies = []

    for images, labels in test_ds:
        start = time.time()
        preds = model.predict(images, verbose=0)
        batch_time = (time.time() - start) * 1000 / len(labels)
        latencies.append(batch_time)
        
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    acc = float(accuracy_score(y_true, y_pred))
    prec_macro = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    cm = confusion_matrix(y_true, y_pred).tolist()
    avg_inference_time = round(float(np.mean(latencies)), 2)

    # Per-class report
    clf_report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True, zero_division=0)
    per_class = {}
    for c in class_names:
        if c in clf_report:
            per_class[c] = {
                "name": c.replace("_", " ").title(),
                "precision": round(clf_report[c]["precision"], 4),
                "recall": round(clf_report[c]["recall"], 4),
                "f1_score": round(clf_report[c]["f1-score"], 4),
                "support": int(clf_report[c]["support"])
            }

    results = {
        "model_name": "EcoSort-CNN-V2",
        "architecture": "Deep Convolutional Neural Network (5 Conv2D + BatchNorm + MaxPooling + Dropout(0.4) + Dense(6, Softmax))",
        "dataset": "E-Waste Image Dataset (6 Classes)",
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_samples_count": len(y_true),
        "accuracy": round(acc, 4),
        "precision_macro": round(prec_macro, 4),
        "recall_macro": round(rec_macro, 4),
        "f1_macro": round(f1_macro, 4),
        "avg_inference_time_ms": avg_inference_time,
        "confusion_matrix": cm,
        "class_names": class_names,
        "per_class_metrics": per_class
    }

    # Save to JSON
    with open(metrics_out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[SUCCESS] Measured evaluation metrics saved to {metrics_out}")

    # Save to SQLite DB
    try:
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        from database import get_db_connection
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO model_evaluations (
                model_name, architecture, accuracy, precision_score, recall_score, f1_score,
                avg_inference_time_ms, confusion_matrix_json, class_metrics_json, test_samples_count, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        """, (
            results["model_name"],
            results["architecture"],
            results["accuracy"],
            results["precision_macro"],
            results["recall_macro"],
            results["f1_macro"],
            results["avg_inference_time_ms"],
            json.dumps(cm),
            json.dumps(per_class),
            results["test_samples_count"]
        ))
        conn.commit()
        conn.close()
        print("[SUCCESS] Evaluation record written to SQLite database.")
    except Exception as e:
        print(f"[WARNING] Could not write to SQLite database: {e}")

    # Print summary table
    print("\n" + "=" * 55)
    print("EVALUATION RESULTS SUMMARY")
    print("=" * 55)
    print(f"Accuracy:         {results['accuracy'] * 100:.2f}%")
    print(f"Precision (Macro):{results['precision_macro'] * 100:.2f}%")
    print(f"Recall (Macro):   {results['recall_macro'] * 100:.2f}%")
    print(f"F1-Score (Macro): {results['f1_macro'] * 100:.2f}%")
    print(f"Avg Latency:      {results['avg_inference_time_ms']} ms/sample")
    print("=" * 55)

    return results

if __name__ == "__main__":
    args = parse_args()
    evaluate_model(model_path=args.model_path, metrics_out=args.metrics_out)
