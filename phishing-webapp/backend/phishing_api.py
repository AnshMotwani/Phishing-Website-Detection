import threading
import pandas as pd
from flask import Flask, request, jsonify
import joblib
import re
import numpy as np
from urllib.parse import urlparse
from sklearn.preprocessing import StandardScaler
import requests
from flask_cors import CORS
from retrain import retrain_model 

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from different origins

# Load the trained model and scaler
model = joblib.load("phishing_model.pkl")
scaler = joblib.load("scaler.pkl")

# Feature extraction function
def extract_features(url):
    features = [
        1 if url.startswith("https") else 0,  # HTTPS presence
        1 if re.search(r'(\d{1,3}\.){3}\d{1,3}', url) else 0,  # IP Address
        len(url),  # URL Length
        int(any(word in url.lower() for word in ['login', 'secure', 'bank', 'update', 'verify', 'account', 'password'])),  # Suspicious keywords
        sum(c.isdigit() for c in url),  # Digit count
        url.count('-'),  # Hyphen count
        urlparse(url).netloc.count('.'),  # Subdomain count
        1 if urlparse(url).netloc.split('.')[-1] in ['tk', 'ml', 'cf', 'ga', 'gq'] else 0,  # Phishing TLD check
        sum(not c.isalnum() for c in url),  # Special character count
        url.count('/'),  # Slash count
        1 if '@' in url else 0,  # '@' symbol presence
        1 if 'https' in url.lower() and not url.startswith('https') else 0  # HTTPS token presence
    ]
    return np.array(features).reshape(1, -1)

# Predict if a website is phishing or safe
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    features = extract_features(url)
    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)[0]
    prediction_proba = model.predict_proba(features_scaled)[0]
    trust_score = round(float(prediction_proba[0]) * 100, 2)

    result = "Phishing" if prediction == 1 else "Safe"
    return jsonify({"url": url, "prediction": result, "trust_score": trust_score})

# **NEW: Report user-labeled phishing or safe websites**
@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    url = data.get("url")
    label = data.get("label")

    if not url or label not in ["safe", "phishing"]:
        return jsonify({"error": "Invalid data"}), 400

    label_value = 1 if label == "phishing" else 0

    # Save user-reported URL to a CSV file
    with open("phishing_reports.csv", "a") as file:
        file.write(f"{url},{label_value}\n")

    # Start model retraining in a separate thread
    threading.Thread(target=retrain_model).start()

    return jsonify({"message": f"URL '{url}' marked as {label} and model retraining started."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
