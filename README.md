# Phishing Website Detection System

A comprehensive, real-time machine learning solution to **detect and report phishing websites** with a modern web interface and browser extension integration.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-000000.svg)](https://flask.palletsprojects.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-1.5+-337ab7.svg)](https://xgboost.readthedocs.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Model Details](#-model-details)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

This project provides a complete solution for detecting phishing websites using machine learning. It combines intelligent feature engineering, a trained XGBoost model, and a user-friendly interface to help users identify potentially malicious URLs in real-time.

### Key Components:
- **ML Model**: XGBoost-based classifier with 95%+ accuracy
- **Web Application**: React-based frontend with modern UI
- **API Backend**: Flask REST API for predictions and reporting
- **Browser Extension**: Chrome extension for seamless integration
- **Automated Retraining**: Self-improving model with user feedback

---

## Features

### Intelligent URL Analysis
- **17+ Feature Extraction**: URL length, suspicious keywords, TLD analysis, domain characteristics
- **Real-time Processing**: Instant classification with confidence scores
- **Advanced Detection**: IP address detection, URL encoding analysis, domain impersonation

### Modern User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes
- **Real-time Feedback**: Animated loading states and color-coded results
- **History Tracking**: Save and review previous URL checks

### Robust Backend
- **RESTful API**: Clean endpoints for predictions and reporting
- **CORS Support**: Cross-origin requests enabled
- **Error Handling**: Comprehensive error management
- **Logging System**: Detailed threat logging and analytics

### Browser Integration
- **Chrome Extension**: Direct browser integration (in development)
- **One-click Reporting**: Report suspicious sites instantly
- **Active Tab Detection**: Automatic URL extraction

---

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │    │ Chrome Extension│
│                 │    │                 │    │                 │
│ • URL Input     │◄──►│ • Feature Ext.  │◄──►│ • Tab Detection │
│ • Results Display│    │ • ML Prediction │    │ • Quick Report  │
│ • History       │    │ • API Endpoints │    │ • Popup UI      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   ML Pipeline   │
                       │                 │
                       │ • XGBoost Model │
                       │ • Feature Scaler│
                       │ • Auto Retrain  │
                       └─────────────────┘
```

---

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **XGBoost** - Gradient boosting framework
- **scikit-learn** - Machine learning utilities
- **pandas** - Data manipulation
- **numpy** - Numerical computing

### Machine Learning
- **XGBoost** - Primary classification model
- **StandardScaler** - Feature normalization
- **Feature Engineering** - 17+ custom features

### Development Tools
- **Jupyter Notebook** - Data analysis and preprocessing
- **Chrome Extension API** - Browser integration

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/phishing-website-detection.git
cd phishing-website-detection
```

### 2. Data Preprocessing
```bash
# Open and run the Jupyter notebook to generate clean dataset
jupyter notebook Script.ipynb
# Run all cells to create cleaned_preprocessed_dataset.csv
```

### 3. Backend Setup
```bash
cd phishing-webapp/backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python phishing_api.py
```

### 4. Frontend Setup
```bash
cd phishing-webapp

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Chrome Extension (Optional)
```bash
# Open Chrome and navigate to chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked" and select phishing-webapp/browser-extension/
```

---

## Usage

### Web Application
1. Open your browser and navigate to `http://localhost:3000`
2. Enter a URL in the input field
3. Click "Check URL" to get instant results
4. View the prediction (Safe/Phishing) and confidence score
5. Toggle between light and dark themes

### API Endpoints
```bash
# Check a URL
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Report a URL
curl -X POST http://localhost:5000/report \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "label": "phishing"}'
```

### Chrome Extension
1. Click the extension icon in your browser
2. The current tab's URL will be automatically detected
3. Click "Check URL" for instant analysis
4. Report false positives/negatives to improve the model

---

## API Documentation

### POST /predict
Analyzes a URL and returns a phishing prediction.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "prediction": "Safe",
  "trust_score": 85.2,
  "source": "model"
}
```

### POST /report
Reports a URL as safe or phishing for model improvement.

**Request:**
```json
{
  "url": "https://example.com",
  "label": "phishing"
}
```

**Response:**
```json
{
  "message": "URL 'https://example.com' marked as phishing."
}
```

---

## Model Details

### Feature Engineering
The system extracts 17 key features from URLs:

1. **HasIPAddress** - Presence of IP address in URL
2. **URLLength** - Total length of the URL
3. **SuspiciousKeyword** - Presence of suspicious words (login, secure, bank, etc.)
4. **DigitCount** - Number of digits in URL
5. **HyphenCount** - Number of hyphens
6. **SubdomainCount** - Number of subdomains
7. **PhishingTLD** - Suspicious top-level domains (.tk, .ml, .cf, etc.)
8. **DigitToLengthRatio** - Ratio of digits to total length
9. **SpecialCharCount** - Count of special characters
10. **SlashCount** - Number of forward slashes
11. **HasAtSymbol** - Presence of @ symbol
12. **HasHTTPSToken** - HTTPS token in non-HTTPS URL
13. **HasURLEncoding** - URL encoding detection
14. **MultipleSubdomains** - Multiple subdomain detection
15. **DomainImpersonation** - Brand impersonation detection
16. **RandomStringDomain** - Random string in domain
17. **PathLength** - Length of URL path

### Model Performance
- **Accuracy**: 95%+
- **F1 Score**: 0.94
- **ROC-AUC**: 0.96
- **Cross-Validation**: 10-fold CV

### Model Training
```bash
# Retrain the model with new data
cd phishing-webapp/backend
python retrain.py
```

---

## Project Structure

```
phishing-website-detection/
├── Script.ipynb                    # Data preprocessing notebook
├── phishing_model.pkl              # Trained XGBoost model
├── scaler.pkl                      # Feature scaler
├──  dataset/                        # Raw and processed datasets
│   ├── phishing_url_website.csv       # Original dataset
│   └── cleaned_preprocessed_dataset.csv # Processed dataset
├──  phishing-webapp/                # Main application
│   ├──  src/                        # React frontend
│   │   ├── App.js                     # Main React component
│   │   ├── styles.css                 # Custom styles
│   │   └── ...
│   ├──  backend/                    # Flask API
│   │   ├── phishing_api.py           # Main API server
│   │   ├── retrain.py                # Model retraining script
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── xgboost_model.json        # XGBoost model file
│   │   ├── scaler.pkl                # Feature scaler
│   │   ├── phishing_reports.csv      # User reports
│   │   └── threat_log.csv            # Threat logging
│   ├──   browser-extension/          # Chrome extension
│   │   ├── manifest.json             # Extension manifest
│   │   ├── popup.html                # Extension popup
│   │   ├── popup.js                  # Popup functionality
│   │   ├── background.js             # Background script
│   │   └── icon.png                  # Extension icon
│   ├── package.json                  # Node.js dependencies
│   └── README.md                     # Web app documentation
└──  README.md                      # Project documentation
```

---

## Automated Retraining

The system includes an automated retraining pipeline:

1. **Data Collection**: User reports are stored in `phishing_reports.csv`
2. **Model Retraining**: `retrain.py` combines new data with existing dataset
3. **Model Update**: New model and scaler are saved automatically
4. **Scheduling**: Can be automated using cron jobs or task schedulers

```bash
# Manual retraining
cd phishing-webapp/backend
python retrain.py

# Automated retraining (cron example)
0 2 * * * cd /path/to/project/phishing-webapp/backend && python retrain.py
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Add tests for new features
- Update documentation as needed

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [Your Portfolio](https://yourportfolio.com)

---

## Acknowledgments

- Dataset sources and contributors
- Open-source libraries and frameworks
- Community feedback and testing

---

## Star History

If you find this project helpful, please give it a star! ⭐

---

## Support

For support, email your.email@example.com or create an issue in this repository.



