-- EcoSort AI SQLite Database Schema
-- CSE Research Project: E-Waste Management Using Machine Learning

PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-Waste Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    hazard_level TEXT NOT NULL, -- 'Low', 'Moderate', 'High', 'Severe'
    key_materials TEXT NOT NULL,
    icon_name TEXT DEFAULT 'box',
    recyclability_rate INTEGER DEFAULT 80, -- percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed Category Disposal Guidance Table
CREATE TABLE IF NOT EXISTS disposal_guidance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL UNIQUE,
    category_slug TEXT NOT NULL,
    handling_instructions TEXT NOT NULL,
    environmental_risks TEXT NOT NULL,
    safety_protocols TEXT NOT NULL,
    recycling_advice TEXT NOT NULL,
    dos TEXT NOT NULL,
    donts TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- Collection Centres Table (clearly flagged with is_demo)
CREATE TABLE IF NOT EXISTS collection_centres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    operating_hours TEXT NOT NULL,
    accepted_items TEXT NOT NULL, -- comma-separated or JSON
    latitude REAL,
    longitude REAL,
    is_demo INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classification History Table
CREATE TABLE IF NOT EXISTS classification_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- NULL for anonymous guest users
    category_slug TEXT NOT NULL,
    category_name TEXT NOT NULL,
    confidence REAL,
    image_filename TEXT,
    is_demo_mode INTEGER DEFAULT 0,
    model_status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Model Performance & Evaluation Records Table
CREATE TABLE IF NOT EXISTS model_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    architecture TEXT NOT NULL,
    accuracy REAL NOT NULL,
    precision_score REAL NOT NULL,
    recall_score REAL NOT NULL,
    f1_score REAL NOT NULL,
    avg_inference_time_ms REAL NOT NULL,
    confusion_matrix_json TEXT NOT NULL,
    class_metrics_json TEXT NOT NULL,
    test_samples_count INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_centres_city ON collection_centres(city);
CREATE INDEX IF NOT EXISTS idx_centres_pin ON collection_centres(pin_code);
CREATE INDEX IF NOT EXISTS idx_history_user ON classification_history(user_id);
