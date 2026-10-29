"""
EcoSort AI - Transfer Learning Training & Evaluation Pipeline
Architecture: MobileNetV2 Feature Extractor + Custom Dense Classification Head
Target Classes (6): mobile_phones, laptops, keyboards, circuit_boards, batteries, chargers_cables
"""

import os
import sys
import time
import json
import argparse
import numpy as np
from PIL import Image, ImageDraw

CLASSES = [
    "mobile_phones",
    "laptops",
    "keyboards",
    "circuit_boards",
    "batteries",
    "chargers_cables"
]

def parse_args():
    parser = argparse.ArgumentParser(description="Train MobileNetV2 Transfer Learning Model for EcoSort AI")
    parser.add_argument("--dataset_dir", type=str, default="dataset", help="Directory containing class subfolders")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--img_size", type=int, default=224, help="Input image dimension (224x224)")
    parser.add_argument("--output_model", type=str, default="backend/ml/models/ecosort_cnn.keras", help="Path to save trained .keras model")
    parser.add_argument("--create_starter_data", action="store_true", help="Generate synthetic starter images if dataset is missing")
    return parser.parse_args()

def generate_starter_dataset(dataset_dir="dataset", samples_per_class=35):
    """
    Generates a starter dataset with representative visual geometric patterns, textures,
    and colors for each e-waste class so transfer learning can be trained and tested end-to-end.
    """
    print(f"\n[INFO] Creating starter dataset in '{dataset_dir}' with {samples_per_class} samples/class...")
    class_palettes = {
        "mobile_phones": {"bg": (30, 41, 59), "primary": (51, 65, 85), "accent": (56, 189, 248), "shape": "rect"},
        "laptops": {"bg": (15, 23, 42), "primary": (71, 85, 105), "accent": (148, 163, 184), "shape": "wide_rect"},
        "keyboards": {"bg": (24, 24, 27), "primary": (63, 63, 70), "accent": (161, 161, 170), "shape": "grid"},
        "circuit_boards": {"bg": (6, 78, 59), "primary": (4, 120, 87), "accent": (234, 179, 8), "shape": "pcb_traces"},
        "batteries": {"bg": (69, 10, 10), "primary": (185, 28, 28), "accent": (239, 68, 68), "shape": "cylindrical"},
        "chargers_cables": {"bg": (17, 24, 39), "primary": (55, 65, 81), "accent": (245, 158, 11), "shape": "coiled"}
    }

    for c in CLASSES:
        cat_dir = os.path.join(dataset_dir, c)
        os.makedirs(cat_dir, exist_ok=True)
        meta = class_palettes[c]

        for i in range(samples_per_class):
            img = Image.new("RGB", (224, 224), color=meta["bg"])
            draw = ImageDraw.Draw(img)

            # Random variations
            offset = np.random.randint(-15, 15)
            
            if meta["shape"] == "rect":
                # Phone silhouette: vertical rounded rectangle with screen
                draw.rounded_rectangle([60 + offset, 25, 164 + offset, 195], radius=14, fill=meta["primary"], outline=meta["accent"], width=3)
                draw.rectangle([70 + offset, 45, 154 + offset, 175], fill=(10, 15, 30))
            elif meta["shape"] == "wide_rect":
                # Laptop silhouette: display lid + base keyboard
                draw.rectangle([35, 35 + offset, 189, 135 + offset], fill=meta["primary"], outline=meta["accent"], width=2)
                draw.polygon([(25, 140 + offset), (199, 140 + offset), (185, 185 + offset), (39, 185 + offset)], fill=(100, 116, 139))
            elif meta["shape"] == "grid":
                # Keyboard matrix: staggered keycaps
                draw.rounded_rectangle([25, 65 + offset, 199, 160 + offset], radius=8, fill=meta["primary"])
                for row in range(4):
                    for col in range(9):
                        kx = 32 + col * 18
                        ky = 72 + row * 20 + offset
                        draw.rectangle([kx, ky, kx + 14, ky + 15], fill=meta["accent"])
            elif meta["shape"] == "pcb_traces":
                # Circuit board: green background with gold/copper trace lines and chip squares
                for _ in range(8):
                    x1, y1 = np.random.randint(20, 204), np.random.randint(20, 204)
                    x2, y2 = np.random.randint(20, 204), np.random.randint(20, 204)
                    draw.line([x1, y1, x2, y2], fill=meta["accent"], width=2)
                # IC chip in center
                draw.rectangle([85, 85, 139, 139], fill=(15, 23, 42), outline=meta["accent"], width=2)
            elif meta["shape"] == "cylindrical":
                # Battery cell or pouch with contact terminals
                draw.rounded_rectangle([55, 45 + offset, 169, 175 + offset], radius=12, fill=meta["primary"], outline=meta["accent"], width=3)
                draw.rectangle([95, 32 + offset, 129, 45 + offset], fill=(203, 213, 225)) # Positive terminal cap
            elif meta["shape"] == "coiled":
                # Charger brick + coiled wire
                draw.rectangle([45, 55 + offset, 115, 125 + offset], fill=meta["primary"], outline=meta["accent"], width=2)
                draw.arc([90, 85 + offset, 185, 175 + offset], start=0, end=270, fill=meta["accent"], width=4)
                draw.arc([110, 105 + offset, 195, 195 + offset], start=90, end=360, fill=meta["accent"], width=3)

            img.save(os.path.join(cat_dir, f"{c}_{i:03d}.jpg"), quality=90)

    print(f"[SUCCESS] Starter dataset created with {len(CLASSES) * samples_per_class} images across {len(CLASSES)} classes.\n")

def build_transfer_model(num_classes=6, img_size=224):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    print("\n[INFO] Loading pre-trained MobileNetV2 backbone...")
    try:
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(img_size, img_size, 3),
            include_top=False,
            weights="imagenet"
        )
        print("[SUCCESS] Loaded pre-trained ImageNet weights for MobileNetV2.")
    except Exception as e:
        print(f"[WARNING] Could not download ImageNet weights ({e}). Initializing MobileNetV2 architecture with random weights.")
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(img_size, img_size, 3),
            include_top=False,
            weights=None
        )

    # Freeze base feature extractor for initial transfer learning
    base_model.trainable = False

    inputs = layers.Input(shape=(img_size, img_size, 3))
    
    # Preprocessing & augmentation inside model
    x = layers.RandomFlip("horizontal")(inputs)
    x = layers.RandomRotation(0.1)(x)
    x = layers.RandomZoom(0.1)(x)
    
    # Feature extraction
    x = base_model(x, training=False)
    
    # Classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="EcoSort_MobileNetV2_Transfer")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

def train_and_evaluate(args):
    try:
        import tensorflow as tf
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ERROR] TensorFlow failed to load: {e}")
        sys.exit(1)

    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

    # Check if dataset exists
    if not os.path.exists(args.dataset_dir) or len(os.listdir(args.dataset_dir)) == 0:
        if args.create_starter_data:
            generate_starter_dataset(args.dataset_dir)
        else:
            print(f"[ERROR] Dataset directory '{args.dataset_dir}' not found.")
            print("To generate starter data, pass `--create_starter_data` or add images to dataset/<class>/.")
            return False

    print("=" * 65)
    print("EcoSort AI - Transfer Learning Training & Evaluation Pipeline")
    print(f"Dataset path:    {args.dataset_dir}")
    print(f"Target classes:  {CLASSES}")
    print(f"Image dimension: {args.img_size}x{args.img_size}x3")
    print(f"Target output:   {args.output_model}")
    print("=" * 65)

    seed = 42

    # 1. Load Dataset with 70% Train, 15% Validation, 15% Test
    print("\n[1/4] Splitting dataset: 70% Train, 15% Validation, 15% Test...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.dataset_dir,
        validation_split=0.3,
        subset="training",
        seed=seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        label_mode="int"
    )

    val_test_ds = tf.keras.utils.image_dataset_from_directory(
        args.dataset_dir,
        validation_split=0.3,
        subset="validation",
        seed=seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        label_mode="int"
    )

    val_batches = tf.data.experimental.cardinality(val_test_ds)
    test_ds = val_test_ds.take(val_batches // 2)
    val_ds = val_test_ds.skip(val_batches // 2)

    # Normalization: map [0, 255] to [0, 1]
    rescale = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (rescale(x), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (rescale(x), y)).prefetch(tf.data.AUTOTUNE)
    test_ds_rescaled = test_ds.map(lambda x, y: (rescale(x), y)).prefetch(tf.data.AUTOTUNE)

    # 2. Build Transfer Learning Model
    print("\n[2/4] Building MobileNetV2 transfer learning architecture...")
    model = build_transfer_model(num_classes=len(CLASSES), img_size=args.img_size)
    model.summary()

    # 3. Train Model
    print(f"\n[3/4] Training model for {args.epochs} epochs...")
    start_time = time.time()
    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2)
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks
    )
    training_duration = round(time.time() - start_time, 2)
    print(f"\n[SUCCESS] Training finished in {training_duration} seconds.")

    # Save model to target location
    os.makedirs(os.path.dirname(args.output_model), exist_ok=True)
    model.save(args.output_model)
    print(f"[SUCCESS] Trained model successfully saved to: {args.output_model}")

    # 4. Strict Evaluation on Held-Out Test Set
    print("\n[4/4] Evaluating model performance strictly on held-out test split...")
    y_true = []
    y_pred = []
    latencies = []

    for images, labels in test_ds_rescaled:
        t0 = time.time()
        preds = model.predict(images, verbose=0)
        batch_latency = ((time.time() - t0) * 1000) / len(labels)
        latencies.append(batch_latency)
        
        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    if len(y_true) == 0:
        print("[WARNING] Test set split was empty due to small dataset size.")
        return True

    # Compute actual measured evaluation metrics
    test_accuracy = float(accuracy_score(y_true, y_pred))
    test_precision = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    test_recall = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    test_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES)))).tolist()
    avg_latency = round(float(np.mean(latencies)), 2)

    # Classification report per class
    report = classification_report(y_true, y_pred, target_names=CLASSES, output_dict=True, zero_division=0)
    per_class = {}
    for c in CLASSES:
        if c in report:
            per_class[c] = {
                "name": c.replace("_", " ").title(),
                "precision": round(report[c]["precision"], 4),
                "recall": round(report[c]["recall"], 4),
                "f1_score": round(report[c]["f1-score"], 4),
                "support": int(report[c]["support"])
            }

    eval_results = {
        "model_name": "EcoSort-MobileNetV2-Transfer",
        "architecture": "MobileNetV2 Backbone (ImageNet Pre-trained) + GlobalAvgPool + Dense(128, ReLU) + Dense(6, Softmax)",
        "dataset": f"E-Waste Dataset ({args.dataset_dir})",
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_samples_count": len(y_true),
        "accuracy": round(test_accuracy, 4),
        "precision_macro": round(test_precision, 4),
        "recall_macro": round(test_recall, 4),
        "f1_macro": round(test_f1, 4),
        "avg_inference_time_ms": avg_latency,
        "confusion_matrix": cm,
        "class_names": CLASSES,
        "per_class_metrics": per_class
    }

    # Save to metrics JSON
    metrics_path = os.path.join(os.path.dirname(__file__), "sample_eval_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)
    print(f"[SUCCESS] Measured evaluation metrics written to: {metrics_path}")

    # Write measured metrics to SQLite database
    try:
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        from database import get_db_connection
        conn = get_db_connection()
        conn.execute("UPDATE model_evaluations SET is_active = 0;")
        conn.execute("""
            INSERT INTO model_evaluations (
                model_name, architecture, accuracy, precision_score, recall_score, f1_score,
                avg_inference_time_ms, confusion_matrix_json, class_metrics_json, test_samples_count, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        """, (
            eval_results["model_name"],
            eval_results["architecture"],
            eval_results["accuracy"],
            eval_results["precision_macro"],
            eval_results["recall_macro"],
            eval_results["f1_macro"],
            eval_results["avg_inference_time_ms"],
            json.dumps(cm),
            json.dumps(per_class),
            eval_results["test_samples_count"]
        ))
        conn.commit()
        conn.close()
        print("[SUCCESS] Active evaluation record saved in SQLite database.")
    except Exception as e:
        print(f"[WARNING] Could not update database record: {e}")

    # Print Measured Summary
    print("\n" + "=" * 65)
    print("ACTUAL MEASURED EVALUATION REPORT (HELD-OUT TEST SET)")
    print("=" * 65)
    print(f"Test Samples:       {eval_results['test_samples_count']}")
    print(f"Measured Accuracy:  {eval_results['accuracy'] * 100:.2f}%")
    print(f"Macro Precision:    {eval_results['precision_macro'] * 100:.2f}%")
    print(f"Macro Recall:       {eval_results['recall_macro'] * 100:.2f}%")
    print(f"Macro F1-Score:     {eval_results['f1_macro'] * 100:.2f}%")
    print(f"Avg Inference Time: {eval_results['avg_inference_time_ms']} ms/item")
    print("=" * 65)
    return True

if __name__ == "__main__":
    args = parse_args()
    train_and_evaluate(args)
