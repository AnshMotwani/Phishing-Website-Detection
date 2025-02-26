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

# Feature extraction function
def extract_features(url):
    features = []
    
    # 1. Is HTTPS
    features.append(1 if url.startswith("https") else 0)
    
    # 2. Is Responsive (Checks if the website is reachable)
    try:
        response = requests.get(url, timeout=5)
        features.append(1 if response.status_code == 200 else 0)
    except:
        features.append(0)
    
    # 3. Presence of an IP Address
    features.append(1 if re.search(r'(\d{1,3}\.){3}\d{1,3}', url) else 0)
    
    # 4. URL Length
    features.append(len(url))
    
    # 5. Presence of suspicious keywords
    suspicious_keywords = ['login', 'secure', 'bank', 'update', 'verify', 'account', 'password']
    features.append(int(any(word in url.lower() for word in suspicious_keywords)))
    
    # 6. Count of digits in URL
    features.append(sum(c.isdigit() for c in url))
    
    # 7. Count of hyphens ('-')
    features.append(url.count('-'))
    
    # 8. Count of subdomains
    domain = urlparse(url).netloc
    features.append(domain.count('.'))
    
    # 9. Check if TLD is commonly associated with phishing
    phishing_tlds = ['tk', 'ml', 'cf', 'ga', 'gq']
    tld = domain.split('.')[-1]
    features.append(1 if tld in phishing_tlds else 0)
    
    # 10. Ratio of Digits to URL Length
    features.append(features[5] / features[3] if features[3] > 0 else 0)
    
    # 11. Number of special characters in URL
    features.append(sum(not c.isalnum() for c in url))
    
    # 12. Count of Slashes ('/')
    features.append(url.count('/'))
    
    # 13. Presence of '@' symbol
    features.append(1 if '@' in url else 0)
    
    # 14. Presence of 'https' token in URL
    features.append(1 if 'https' in url.lower() and not url.startswith('https') else 0)
    
    return np.array(features).reshape(1, -1)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get("url")
    
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    
    features = extract_features(url)
    features_scaled = scaler.transform(features)
    print("Extracted Features:", features)
    print("Scaled Features:", features_scaled)
    prediction = model.predict(features_scaled)[0]
    
    result = "Phishing" if prediction == 1 else "Safe"
    return jsonify({"url": url, "prediction": result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
