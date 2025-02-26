import React, { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const checkPhishing = async () => {
    setLoading(true);
    setResult(null);
    setTrustScore(null);

    let formattedUrl = url.trim().replace(/\/+$/, "");
    
    console.log("Sending request to API with URL:", formattedUrl);
    debugger;
    
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      debugger;
      
      setResult(data.prediction);
      setTrustScore(data.trust_score !== undefined ? `${data.trust_score}%` : "N/A");
      setHistory(prevHistory => [...prevHistory, { url: formattedUrl, prediction: data.prediction, trustScore: data.trust_score !== undefined ? `${data.trust_score}%` : "N/A" }]);
    } catch (error) {
      console.error("Error connecting to server:", error);
      setResult("Error: Could not connect to server");
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} p-8 transition-all`}> 
      <div className="flex justify-between items-center w-full max-w-lg p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-xl">
        <h1 className="text-4xl font-extrabold tracking-wide">🔍 Phishing Website Detector</h1>
        <button
          className="p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
      <div className="mt-8 w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-300">
        <input
          type="text"
          placeholder="Enter website URL..."
          className="border rounded-lg p-4 w-full mb-4 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={checkPhishing}
          className="w-full bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
          disabled={loading}
        >
          {loading ? "🔄 Checking..." : "🔍 Check URL"}
        </button>
      </div>
      {loading && <div className="mt-4 text-lg animate-pulse">🔄 Checking...</div>}
      {result && (
        <div className={`mt-6 p-6 text-lg font-semibold rounded-xl shadow-md text-center border-2 border-gray-300 ${
          result.toLowerCase() === "safe" ? "bg-green-100 text-green-700 border-green-500" : "bg-red-100 text-red-700 border-red-500"
        }`}>
          {result.toLowerCase() === "safe" ? "✅ This website is Safe" : "🚨 This website is Phishing!"}
          <p className="mt-2 text-gray-800 dark:text-gray-200 font-medium">🔍 Trust Score: {trustScore}</p>
        </div>
      )}
      {history.length > 0 && (
        <div className="mt-8 w-full max-w-lg bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-400">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">📜 Recent Checks</h2>
          <ul className="space-y-3">
            {history.slice(-5).reverse().map((entry, index) => (
              <li key={index} className={`p-4 rounded-lg shadow-md border text-lg font-medium transition ${entry.prediction.toLowerCase() === "safe" ? "bg-green-100 text-green-700 border-green-500 hover:bg-green-200" : "bg-red-100 text-red-700 border-red-500 hover:bg-red-200"}`}>
                <span className="font-bold">🔗 {entry.url}</span> - {entry.prediction === "Safe" ? "✅ Safe" : "🚨 Phishing"} (Trust Score: {entry.trustScore})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
