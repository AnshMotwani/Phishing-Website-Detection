# 🛡️ Phishing Website Detection System

A real-time Machine Learning-powered solution to **detect and report phishing websites** with a modern UI and browser integration.

---

## 📌 Overview

This project aims to safeguard users from phishing attacks by leveraging a trained ML model to classify URLs as *Safe* or *Phishing*. It includes:

- 🖥️ **React Web App** – User-friendly interface for URL checks.
- 🧠 **Flask API Backend** – Handles prediction, feature extraction, and reporting.
- 🧩 **Chrome Extension** *(in progress)* – Report suspicious sites directly from your browser.

---

## 🚀 Features

### 🔍 Intelligent Feature Engineering

The system extracts key indicators from URLs, including:

- ✅ HTTPS usage
- ✅ URL length
- ✅ Suspicious keywords (e.g., `bank`, `login`, `secure`)
- ✅ Count of:
  - Digits
  - Hyphens
  - Special characters
  - Slashes
- ✅ Subdomain count
- ✅ Presence of `@` symbol
- ✅ TLD risk check (e.g., `.tk`, `.ml`)
- ✅ Digit-to-length ratio

✔ Data is preprocessed and normalized before model input.

---

### 🤖 Machine Learning Model

- Models Trained:
  - 🌲 Random Forest
  - 💠 SVM
  - ⚡ XGBoost
  - 🧠 Neural Network
- Evaluation Metrics:
  - ✅ F1 Score
  - ✅ Accuracy
  - ✅ Confusion Matrix
  - ✅ ROC Curve
  - ✅ 10-Fold Cross-Validation

🏆 **Final Model:** `XGBoost` (fast, accurate, easy to retrain)

- 📁 Saved as: `phishing_model.pkl`
- ⚖️ Scaler: `scaler.pkl`

---

### 🧪 Backend – Flask API (`phishing_api.py`)

- 🔌 `POST /predict` – Accepts a URL, extracts features, normalizes, and returns prediction.
- 🚨 `POST /report` – Report phishing websites for model improvement.
- 📈 Returns **Trust Score** along with prediction.
- 📄 Stores reports in `reported_sites.csv`
- 🔄 CORS enabled for React app and extension.

---

### 💻 Frontend – React Web App

- 🌐 Enter URL to check
- 📤 Sends request to backend
- ✅ Displays result as:
  - 🟩 **Safe**
  - 🟥 **Phishing**
- 📊 Shows **Trust Score**
- 🌓 Toggle between Light/Dark Mode
- 🕘 History of checked URLs

#### ✨ UI Highlights

- 🎨 Clean gradient background
- 🔄 Animated loading indicators
- 🟥🟩 Color-coded result cards
- 📱 Mobile-first responsive design via **Tailwind CSS**

---

### 🧩 Chrome Extension *(Work in Progress)*

- 🌍 Auto-detects active tab's URL
- 🚨 Report site as Safe or Phishing with a click
- 📡 Sends data to Flask API
- ✅ Shows confirmation for successful reports

📌 *Next Milestone:* Enable automatic retraining when new reports are submitted.

---

### 🔁 Automated Model Retraining

- Script: `retrain.py`
- Tasks:
  - Combine existing + newly reported data
  - Retrain XGBoost model
  - Save updated model + scaler
- 🕒 Can be scheduled using **cron** or other schedulers

---

## 🛠️ Getting Started

### ✅ Step 1: Generate Clean Dataset

1. Open `script.ipynb` notebook.
2. Run all cells to clean raw data and export training-ready dataset.

---

### ✅ Step 2: Start Backend Server

# Navigate to backend folder
cd phishing-webapp/backend

# Run Flask API
python phishing_api.py

---

### ✅ Step 3: Start React Frontend

# Open a new terminal
cd phishing-webapp

# Install dependencies
npm install

# Start development server
npm start

