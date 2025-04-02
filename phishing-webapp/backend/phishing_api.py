import pandas as pd
from flask import Flask, request, jsonify
import re
import numpy as np
from urllib.parse import urlparse
from sklearn.preprocessing import StandardScaler
import requests
from flask_cors import CORS
from datetime import datetime, timezone
import xgboost as xgb
import joblib

app = Flask(__name__)
CORS(app)

# Load the trained XGBoost model and scaler
model = xgb.Booster()
model.load_model("xgboost_model.json")

scaler = joblib.load("scaler.pkl")  # Keep this only if you used scaling before prediction

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
    domain = urlparse(url).netloc.split('.')[0]

    feature_dict = {
        'HasIPAddress': feature_weights['HasIPAddress'] if re.search(r'(\d{1,3}\.){3}\d{1,3}', url) else 0,
        'URLLength': url_length * feature_weights['URLLength'],
        'SuspiciousKeyword': feature_weights['SuspiciousKeyword'] if any(word in url.lower() for word in ['login', 'secure', 'bank', 'update', 'verify', 'account', 'password']) else 0,
        'DigitCount': digit_count * feature_weights['DigitCount'],
        'HyphenCount': url.count('-') * feature_weights['HyphenCount'],
        'SubdomainCount': urlparse(url).netloc.count('.') * feature_weights['SubdomainCount'],
        'PhishingTLD': feature_weights['PhishingTLD'] if urlparse(url).netloc.split('.')[-1] in ['tk', 'ml', 'cf', 'ga', 'gq'] else 0,
        'DigitToLengthRatio': (digit_count / url_length if url_length > 0 else 0) * feature_weights['DigitToLengthRatio'],
        'SpecialCharCount': sum(not c.isalnum() for c in url) * feature_weights['SpecialCharCount'],
        'SlashCount': url.count('/') * feature_weights['SlashCount'],
        'HasAtSymbol': feature_weights['HasAtSymbol'] if '@' in url else 0,
        'HasHTTPSToken': feature_weights['HasHTTPSToken'] if 'https' in url.lower() and not url.startswith('https') else 0,
        'HasURLEncoding': feature_weights['HasURLEncoding'] if url != requests.utils.unquote(url) else 0,
        'MultipleSubdomains': feature_weights['MultipleSubdomains'] if urlparse(url).netloc.count('.') > 2 else 0,
        'DomainImpersonation': feature_weights['DomainImpersonation'] if any(brand in urlparse(url).netloc.lower() and '-' in urlparse(url).netloc.lower() for brand in ['paypal', 'google', 'facebook', 'amazon', 'bank']) else 0,
        'RandomStringDomain': feature_weights['RandomStringDomain'] if len(domain) > 0 and (sum(c.isalpha() for c in domain) / len(domain)) < 0.6 else 0,
        'PathLength': len(urlparse(url).path) * feature_weights['PathLength'],
    }

    return pd.DataFrame([feature_dict])

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        reports_df = pd.read_csv("phishing_reports.csv", names=["url", "label"])
        match = reports_df[reports_df["url"] == url]
        if not match.empty:
            label = int(match.iloc[-1]["label"])
            result = "Phishing" if label == 1 else "Safe"
            log_threat(url, result, trust_score=100.0, source="user")
            return jsonify({
                "url": url,
                "prediction": result,
                "trust_score": 100.0,
                "source": "user"
            })
    except FileNotFoundError:
        pass

    features_df = extract_features(url)
    features_scaled = scaler.transform(features_df)
    dtest = xgb.DMatrix(features_scaled)

    pred_proba = float(model.predict(dtest)[0])
    prediction = 1 if pred_proba > 0.65 else 0
    trust_score = round(pred_proba * 100, 2)

    result = "Phishing" if prediction == 1 else "Safe"
    log_threat(url, result, trust_score, source="model")

    return jsonify({
        "url": url,
        "prediction": result,
        "trust_score": trust_score,
        "source": "model"
    })

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    url = data.get("url")
    label = data.get("label")
    if not url or label not in ["safe", "phishing"]:
        return jsonify({"error": "Invalid data"}), 400

    label_value = 1 if label == "phishing" else 0
    with open("phishing_reports.csv", "a") as file:
        file.write(f"{url},{label_value}\n")

    return jsonify({"message": f"URL '{url}' marked as {label}."})

def log_threat(url, prediction, trust_score, source="model"):
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S %Z")
    with open("threat_log.csv", "a") as log_file:
        log_file.write(f"{timestamp},{url},{prediction},{trust_score},{source}\n")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
