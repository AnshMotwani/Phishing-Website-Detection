import pandas as pd
from flask import Flask, request, jsonify
import joblib
import re
import numpy as np
from urllib.parse import urlparse
from sklearn.preprocessing import StandardScaler
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from different origins

# Load the trained model and scaler
model = joblib.load("phishing_model.pkl")
scaler = joblib.load("scaler.pkl")

# Define feature weight mapping
feature_weights = {
    'HasIPAddress': 2,
    'URLLength': 1,
    'SuspiciousKeyword': 3,
    'DigitCount': 1,
    'HyphenCount': 1,
    'SubdomainCount': 2,
    'PhishingTLD': 3,
    'DigitToLengthRatio': 1,
    'SpecialCharCount': 2,
    'SlashCount': 1,
    'HasAtSymbol': 3,
    'HasHTTPSToken': 2,
    'HasURLEncoding': 2,
    'MultipleSubdomains': 3,
    'DomainImpersonation': 4,
    'RandomStringDomain': 4,
    'PathLength': 2
}

def extract_features(url):
    digit_count = sum(c.isdigit() for c in url)
    url_length = len(url)

    features = np.array([
        feature_weights['HasIPAddress'] if re.search(r'(\d{1,3}\.){3}\d{1,3}', url) else 0,
        url_length * feature_weights['URLLength'],
        feature_weights['SuspiciousKeyword'] if any(word in url.lower() for word in ['login', 'secure', 'bank', 'update', 'verify', 'account', 'password']) else 0,
        digit_count * feature_weights['DigitCount'],
        url.count('-') * feature_weights['HyphenCount'],
        urlparse(url).netloc.count('.') * feature_weights['SubdomainCount'],
        feature_weights['PhishingTLD'] if urlparse(url).netloc.split('.')[-1] in ['tk', 'ml', 'cf', 'ga', 'gq'] else 0,
        (digit_count / url_length if url_length > 0 else 0) * feature_weights['DigitToLengthRatio'],
        sum(not c.isalnum() for c in url) * feature_weights['SpecialCharCount'],
        url.count('/') * feature_weights['SlashCount'],
        feature_weights['HasAtSymbol'] if '@' in url else 0,
        feature_weights['HasHTTPSToken'] if 'https' in url.lower() and not url.startswith('https') else 0,
        feature_weights['HasURLEncoding'] if url != requests.utils.unquote(url) else 0,
        feature_weights['MultipleSubdomains'] if urlparse(url).netloc.count('.') > 2 else 0,
        feature_weights['DomainImpersonation'] if any(brand in urlparse(url).netloc.lower() and '-' in urlparse(url).netloc.lower() for brand in ['paypal', 'google', 'facebook', 'amazon', 'bank']) else 0,
        feature_weights['RandomStringDomain'] if sum(c.isalpha() for c in urlparse(url).netloc.split('.')[0]) / len(urlparse(url).netloc.split('.')[0]) < 0.6 else 0,
        len(urlparse(url).path) * feature_weights['PathLength'],
    ]).reshape(1, -1)

    return features

# Predict if a website is phishing or safe
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # ✅ Check user-reported CSV first
    try:
        reports_df = pd.read_csv("phishing_reports.csv", names=["url", "label"])
        match = reports_df[reports_df["url"] == url]
        if not match.empty:
            label = int(match.iloc[-1]["label"])
            result = "Phishing" if label == 1 else "Safe"
            return jsonify({
                "url": url,
                "prediction": result,
                "trust_score": 100.0,
                "source": "user"
            })
    except FileNotFoundError:
        pass  # Continue with model

    # 🔁 ML fallback
    features = extract_features(url)
    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)[0]
    prediction_proba = model.predict_proba(features_scaled)[0]
    trust_score = round(float(prediction_proba[0]) * 100, 2)

    result = "Phishing" if prediction == 1 else "Safe"
    return jsonify({
        "url": url,
        "prediction": result,
        "trust_score": trust_score,
        "source": "model"
    })

# Report user-labeled websites
@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    url = data.get("url")
    label = data.get("label")

    if not url or label not in ["safe", "phishing"]:
        return jsonify({"error": "Invalid data"}), 400

    label_value = 1 if label == "phishing" else 0

    # Save to CSV
    with open("phishing_reports.csv", "a") as file:
        file.write(f"{url},{label_value}\n")

    return jsonify({"message": f"URL '{url}' marked as {label}."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)