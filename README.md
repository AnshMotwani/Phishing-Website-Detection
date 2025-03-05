# Phishing Website Detection System

A Machine Learning-based System for Detecting Phishing Websites  

## 📌 Project Overview  
This project aims to detect phishing websites using a trained machine learning model. The system consists of:  
- **A Web Application (React)** – Users can enter a URL to check if it's a phishing website.  
- **A Flask API (Backend)** – Handles feature extraction, ML predictions, and phishing site reporting.  
- **A Chrome Extension (Work in Progress)** – Allows users to report phishing sites to improve the model.  


## 🚀 Features

### 1️⃣ **Feature Engineering**  
Extracted key phishing indicators from URLs:
- ✅ **Presence of HTTPS**
- ✅ **Length of URL**
- ✅ **Suspicious keywords** (e.g., "bank", "login", "secure")
- ✅ **Number of digits, hyphens, special characters**
- ✅ **Number of subdomains**
- ✅ **Presence of '@' symbol** (misleading URLs)
- ✅ **TLD check** (Certain domains like `.tk`, `.ml` are suspicious)
- ✅ **Slash count** (Redirections in URLs)
- ✅ **Ratio of digits to total length** (used by phishing sites)  
✔ **Preprocessed and normalized features** for model training.  

### 2️⃣ **Machine Learning Model**  
✔ **Trained multiple models** (Random Forest, SVM, XGBoost, Neural Networks).  
✔ Evaluated models using:  
- ✅ **F1-score**
- ✅ **Accuracy**
- ✅ **10-Fold Cross-Validation**
- ✅ **Confusion Matrix**
- ✅ **ROC Curve (Zoomed In for better analysis)**  
✔ **Final Model Chosen**: **XGBoost ( Since fast execution and retraining and good accuracy )** (Best performance).  
✔ **Saved the trained model** (`phishing_model.pkl`) and **scaler** (`scaler.pkl`) for inference.  

### 3️⃣ **Flask API Backend**  
✔ Developed **`phishing_api.py`** using **Flask** to:
- ✅ Accept **URLs** via `POST /predict`
- ✅ Extract **features dynamically** from the user input URL.
- ✅ Normalize the **features** using the saved scaler.
- ✅ Return **phishing prediction** (`Safe` or `Phishing`).
- ✅ Compute and display **Trust Score** (confidence level).
- ✅ Allow users to **report phishing sites** (`POST /report`).
- ✅ Save reported sites into `reported_sites.csv`.  
✔ **Added CORS support** to allow API calls from the React web app and browser extension.

### 4️⃣ **React Web App (Frontend)**
✔ **Built a React UI** (`App.js`) that:
- ✅ Allows users to **enter a website URL**.
- ✅ Sends the URL to the Flask API for **phishing detection**.
- ✅ Displays **"Safe"** or **"Phishing"** result.
- ✅ Shows **Trust Score** for prediction confidence.
- ✅ Supports **Dark Mode Toggle** 🌙.
- ✅ Keeps a **history** of past checked websites.  

✔ **Added Visual Enhancements:**
- ✅ Gradient Background 🎨.
- ✅ Animated **Loading State** 🔄.
- ✅ Colored **Result Cards** (Green for Safe, Red for Phishing).
- ✅ Recent **Check History Section** 📜.
- ✅ Mobile Responsive **(Tailwind CSS)**.

### 5️⃣ **Browser Extension (Work In Progress 🚧)**
✔ Developed a **Chrome Extension UI** (`popup.html`, `popup.js`) that:
- ✅ **Auto-detects** the current website.
- ✅ Allows users to **report websites** as **"Safe"** or **"Phishing"**.
- ✅ Sends **reported URLs to the backend API** (`/report`).
- ✅ Displays confirmation messages.  
✔ Next Step: **Trigger Model Retraining Automatically** when new sites are reported.

---

## 🔄 **Model Retraining & Automation**
✔ Created a **`retrain.py`** script to:
- ✅ Load **existing dataset**.
- ✅ Append **newly reported sites**.
- ✅ **Retrain the ML model** automatically.
- ✅ Save the **updated model** (`phishing_model.pkl`).
✔ **Setup cron job / scheduler** to **run `retrain.py` periodically**.

---

 ## Deployment Plan
- Frontend on Vercel (React)
- Backend on Render / AWS (Flask API)
- Database to store reported sites
- Browser Extension Upload to Chrome Web Store

 ## What’s Next?
- Automate model retraining whenever users report phishing sites.
- Deploy Backend to Render / AWS.
- Host Web App on Vercel.
- Publish Chrome Extension to the Chrome Web Store.