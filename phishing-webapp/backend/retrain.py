import pandas as pd
import joblib
import re
import numpy as np
from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Feature extraction function
def extract_features_from_url(url):
    features = [
        1 if url.startswith("https") else 0,
        1 if re.search(r'(\d{1,3}\.){3}\d{1,3}', url) else 0,
        len(url),
        int(any(word in url.lower() for word in ['login', 'secure', 'bank', 'update', 'verify', 'account', 'password'])),
        sum(c.isdigit() for c in url),
        url.count('-'),
        urlparse(url).netloc.count('.'),
        1 if urlparse(url).netloc.split('.')[-1] in ['tk', 'ml', 'cf', 'ga', 'gq'] else 0,
        sum(not c.isalnum() for c in url),
        url.count('/'),
        1 if '@' in url else 0,
        1 if 'https' in url.lower() and not url.startswith('https') else 0
    ]
    return features

def retrain_model():
    print("Retraining the model with new data...")

    # Load new data from user reports
    df = pd.read_csv("phishing_reports.csv", names=["URL", "label"])
    
    # Extract features from reported URLs
    df_features = df["URL"].apply(extract_features_from_url)
    df_features = pd.DataFrame(df_features.tolist(), columns=[
        "IsHTTPS", "HasIPAddress", "URLLength", "SuspiciousKeyword", "DigitCount",
        "HyphenCount", "SubdomainCount", "PhishingTLD", "SpecialCharCount",
        "SlashCount", "HasAtSymbol", "HasHTTPSToken"
    ])
    df_features["label"] = df["label"]

    # Split the dataset
    X = df_features.drop(columns=["label"])
    y = df_features["label"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Save the new model and scaler
    joblib.dump(model, "phishing_model.pkl")
    joblib.dump(scaler, "scaler.pkl")

    print("Model retrained and saved successfully.")

if __name__ == "__main__":
    retrain_model()
