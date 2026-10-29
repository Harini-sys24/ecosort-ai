"""
EcoSort AI - CNN Model Training Script
CSE Research Project: "The Environmental Cost of Our Digital Life: A Smart Approach to E-Waste Management Using Machine Learning"

This script trains a Deep Convolutional Neural Network (CNN) to categorize e-waste into 6 classes:
1. mobile_phones
2. laptops
3. keyboards
4. circuit_boards
5. batteries
6. chargers_cables

Data organization:
dataset/
├── mobile_phones/
├── laptops/
├── keyboards/
├── circuit_boards/
├── batteries/
└── chargers_cables/
"""

import os
import sys
import argparse
import json
import time

CLASSES = ["mobile_phones", "laptops", "keyboards", "circuit_boards", "batteries", "chargers_cables"]

def parse_args():
    parser = argparse.ArgumentParser(description="Train CNN model for EcoSort AI E-Waste Classification")
    parser.add_argument("--dataset_dir", type=str, default="dataset", help="Path to image dataset folder")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--img_size", type=int, default=224, help="Input image dimension (default: 224)")
    parser.add_argument("--output_model", type=str, default="backend/ml/models/ecosort_cnn.keras", help="Path to save trained model")
    return parser.parse_args()

def build_cnn_model(input_shape=(224, 224, 3), num_classes=6):
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
    except ImportError:
        print("[ERROR] TensorFlow is required for training. Please install via: pip install tensorflow")
        sys.exit(1)

    model = models.Sequential([
        # Data Augmentation layer inside model
        layers.Input(shape=input_shape),
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        
        # Block 1
        layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),

        # Block 2
        layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),

        # Block 3
        layers.Conv2D(128, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),

        # Block 4
        layers.Conv2D(256, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),

        # Classification Head
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.4),
        layers.Dense(num_classes, activation="softmax")
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

def main():
    args = parse_args()
    print("=" * 60)
    print("EcoSort AI - E-Waste CNN Training Pipeline")
    print(f"Dataset directory: {args.dataset_dir}")
    print(f"Target categories: {CLASSES}")
    print("=" * 60)

    if not os.path.exists(args.dataset_dir):
        print(f"\n[WARNING] Dataset directory '{args.dataset_dir}' does not exist.")
        print("To train a real model on custom data:")
        print("  1. Create the dataset folder structure:")
        for c in CLASSES:
            print(f"     {args.dataset_dir}/{c}/")
        print("  2. Place corresponding JPG/PNG images into each subfolder.")
        print(f"  3. Re-run: python backend/ml/train.py --dataset_dir {args.dataset_dir} --epochs 25")
        return

    try:
        import tensorflow as tf
    except ImportError:
        print("\n[ERROR] TensorFlow is not installed in the current Python environment.")
        print("Please install TensorFlow: pip install tensorflow")
        return

    print("Splitting dataset: 70% Train, 15% Validation, 15% Test...")
    seed = 42
    
    # Keras utility to load from directory with split
    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.dataset_dir,
        validation_split=0.3,
        subset="training",
        seed=seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size
    )

    val_test_ds = tf.keras.utils.image_dataset_from_directory(
        args.dataset_dir,
        validation_split=0.3,
        subset="validation",
        seed=seed,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size
    )

    val_batches = tf.data.experimental.cardinality(val_test_ds)
    test_ds = val_test_ds.take(val_batches // 2)
    val_ds = val_test_ds.skip(val_batches // 2)

    # Normalize pixel values
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y)).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y)).prefetch(tf.data.AUTOTUNE)
    test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y)).prefetch(tf.data.AUTOTUNE)

    print("Building Deep CNN Architecture...")
    model = build_cnn_model(input_shape=(args.img_size, args.img_size, 3), num_classes=len(CLASSES))
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3)
    ]

    print("\nStarting model training...")
    start_time = time.time()
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks
    )
    training_duration = time.time() - start_time
    print(f"Training completed in {training_duration:.2f} seconds.")

    os.makedirs(os.path.dirname(args.output_model), exist_ok=True)
    model.save(args.output_model)
    print(f"[SUCCESS] Model saved to: {args.output_model}")

    print("\nTriggering evaluation on held-out test split...")
    from evaluate import evaluate_model
    evaluate_model(model=model, test_ds=test_ds, class_names=CLASSES)

if __name__ == "__main__":
    main()
