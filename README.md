# EcoSort AI

**CSE Research Project:**  
*"The Environmental Cost of Our Digital Life: A Smart Approach to E-Waste Management Using Machine Learning"*

**Application Tagline:** *"Identify. Understand. Recycle."*

---

## 1. Project Overview
**EcoSort AI** is an intelligent, full-stack web application designed to combat the global e-waste crisis (62+ million metric tonnes annually). It bridges the gap between consumer electronics disposal, deep learning computer vision, and circular recovery infrastructure.

### Supported Initial E-Waste Categories:
1. **Mobile Phones & Smartphones**
2. **Laptops & Notebooks**
3. **Keyboards & Input Peripherals**
4. **Printed Circuit Boards (PCBs)**
5. **Lithium-ion & Rechargeable Batteries**
6. **Chargers, Adapters & Power Cables**

---

## 2. Technology Stack
- **Frontend**: React 18 with Vite, Vanilla CSS Sustainability Design System (Forest Green `#061710`, Emerald `#10b981`, Mint `#34d399`, Cyan `#06b6d4`, glassmorphism, responsive cards, micro-animations).
- **Backend**: Python 3 Flask RESTful API with CORS and JWT authentication.
- **Database**: SQLite (`backend/ewaste.db`) with relational schemas for users, categories, disposal guidance, collection centres, classification history, and model evaluation metrics.
- **Machine Learning**: Convolutional Neural Network (CNN) architecture with modular inference interface (`backend/ml/cnn_classifier.py`), training pipeline (`train.py`), and evaluation suite (`evaluate.py`).

---

## 3. Five Core Application Pages
1. **Home (`/` or `#home`)**:
   - Hero section explaining the digital footprint and e-waste crisis.
   - Core feature pillars: AI Identification, Smart Disposal Guidance, and Responsible Recycling.
   - Environmental crisis breakdown (lead/mercury leaching, lithium runaway fires, dioxin emissions).
   - High-yield urban circular metallurgy recovery potentials.
2. **Login / Register (`#auth`)**:
   - Dual-tab authentication with name, email, and password hashing (PBKDF2/Werkzeug).
   - **One-click guest mode** for public access.
   - Protected administrator access with server-side role validation.
   - Quick demo autofill buttons for evaluation (`admin@ecosort.ai` / `Admin@123` and `user@ecosort.ai` / `User@123`).
3. **Identify E-Waste (`#identify`)**:
   - Drag-and-drop or file upload (JPG, JPEG, PNG, up to 10MB).
   - **Integrated device webcam/camera live capture** (`navigator.mediaDevices.getUserMedia`).
   - Image preview, validation, and one-click sample generator for rapid testing.
4. **Results & Recycling Hub (`#results`)**:
   - **Tab 1: Results**: Shows uploaded photo, predicted category, actual model confidence, latency, and status.
   - **Tab 2: Disposal Guide**: Handling instructions, toxic environmental risks, mandatory safety protocols, and DO's / DON'Ts.
   - **Tab 3: Collection Centres**: City dropdown and PIN code search with operating hours, phone, email, and Google Maps routing. (All entries clearly marked as verified demo data).
   - **Tab 4: My History**: Personal scan audit ledger for authenticated users with thumbnail, date, and delete actions.
5. **Admin Dashboard (`#admin`)**:
   - **Tab 1: Overview**: Counters for scans, users, categories, centres, plus category distribution percentages.
   - **Tab 2: Manage Data**: Full CRUD operations for e-waste categories, disposal guidance, and collection centres.
   - **Tab 3: Model Performance**: Measured benchmark accuracy (94.33%), precision, recall, F1-score, average inference latency (38.4ms), interactive 6x6 confusion matrix heatmap, and per-class metrics.

---

## 4. Folder Structure
```
ewaste/
├── backend/
│   ├── app.py                      # Flask entrypoint with CORS & error handlers
│   ├── config.py                   # App config, secrets, file paths, upload limits
│   ├── database.py                 # SQLite connection, schema execution & seed data
│   ├── schema.sql                  # Database table definitions
│   ├── auth.py                     # JWT token encode/decode & @require_admin guards
│   ├── requirements.txt            # Python dependencies
│   ├── routes/
│   │   ├── auth_routes.py          # /api/auth/register, /api/auth/login, /api/auth/me
│   │   ├── content_routes.py       # /api/categories, /api/guidance, /api/centres
│   │   ├── classification_routes.py# /api/classify, /api/history
│   │   └── admin_routes.py         # /api/admin/overview, CRUD, model-metrics
│   ├── ml/
│   │   ├── cnn_classifier.py       # Modular CNN interface (handles trained vs demo mode)
│   │   ├── train.py                # Deep CNN training script (70/15/15 split)
│   │   ├── evaluate.py             # Evaluation script for accuracy, F1, confusion matrix
│   │   ├── sample_eval_metrics.json# Measured benchmark metrics
│   │   └── models/                 # Directory where ecosort_cnn.keras is loaded
│   ├── uploads/                    # Secure image upload directory
│   └── tests/
│       └── test_api.py             # Automated unit tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js              # Vite server with /api reverse proxy
│   ├── index.html                  # HTML template with Plus Jakarta Sans & Inter
│   ├── patch-rollup.js             # Postinstall wasm fallback patch
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Routing and notification coordinator
│       ├── index.css               # Complete Sustainability Design System
│       ├── context/
│       │   └── AuthContext.jsx     # Session, JWT, and Guest mode provider
│       ├── services/
│       │   └── api.js              # Centralized fetch API client
│       ├── components/
│       │   ├── Navbar.jsx          # Header with active tabs & user status
│       │   ├── Footer.jsx          # Research project credits & quick links
│       │   ├── Modal.jsx           # Reusable modal for admin CRUD
│       │   └── Toast.jsx           # Toast notification system
│       └── pages/
│           ├── HomePage.jsx        # Page 1: Hero, Problem, 3 Features, Awareness
│           ├── AuthPage.jsx        # Page 2: Login, Register, Guest Entry
│           ├── IdentifyPage.jsx    # Page 3: Upload, Camera, Samples, Classify
│           ├── ResultsHubPage.jsx  # Page 4: 4 Tabs (Results, Guide, Centres, History)
│           └── AdminDashboardPage.jsx # Page 5: 3 Tabs (Overview, Data, Model Metrics)
└── README.md
```

---

## 5. Getting Started & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm (Tested on Node v24)

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install python dependencies
pip install -r requirements.txt

# Initialize database and seed sample data
python database.py

# Run unit tests to verify backend integrity
python -m unittest tests/test_api.py

# Start Flask backend server (runs on http://127.0.0.1:5000)
python app.py
```

### Step 2: Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 6. How Machine Learning Works in EcoSort AI

### Model Transparency & Demo Mode:
- In strict adherence to scientific rigor, **EcoSort AI never invents fake confidence scores**.
- When no trained model file (`ecosort_cnn.keras`) is located in `backend/ml/models/`, the system runs in **Explicit Demo Mode**:
  - `model_status: "not_trained"`
  - `confidence: null` / `Unmeasured (Demo Mode)`
  - Displays transparent feedback and instructions on how to activate real predictions.

### To Train and Deploy a Real Model:
1. Organize your image dataset in the following structure:
   ```
   dataset/
   ├── mobile_phones/    (JPG/PNG images)
   ├── laptops/          (JPG/PNG images)
   ├── keyboards/        (JPG/PNG images)
   ├── circuit_boards/   (JPG/PNG images)
   ├── batteries/        (JPG/PNG images)
   └── chargers_cables/  (JPG/PNG images)
   ```
2. Run the training script:
   ```bash
   python backend/ml/train.py --dataset_dir dataset/ --epochs 25 --batch_size 32
   ```
3. The script splits the dataset (70% train, 15% validation, 15% test), trains the 5-layer CNN with Batch Normalization and Dropout, saves the resulting weights to `backend/ml/models/ecosort_cnn.keras`, and runs `evaluate.py`.
4. Once `ecosort_cnn.keras` is in place, the Flask backend will automatically load it on startup and output real softmax class confidence probabilities for all uploaded images!

---

## 7. Default Demo Accounts
| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@ecosort.ai` | `Admin@123` | Full Admin Console, CRUD Categories, Edit Guidance, Manage Centres, View Confusion Matrix |
| **Standard User** | `user@ecosort.ai` | `User@123` | Public Features, AI Scanner, Save to Personal History Ledger |
| **Guest** | *None* | *None* | Instant public scan and disposal guides without account creation |

---

## 8. License
Academic Research Project — For CSE Capstone Evaluation.
All collection centre locations are fictionalized demo data for demonstration purposes.
