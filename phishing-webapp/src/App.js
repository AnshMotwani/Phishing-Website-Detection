import React, { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("light");

  useEffect(() => {
    document.body.classList.remove("dark-mode", "rgb-mode");
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
    } else if (mode === "rgb") {
      document.body.classList.add("rgb-mode");
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => {
      if (prevMode === "light") return "dark";
      if (prevMode === "dark") return "rgb";
      return "light";
    });
  };

  const checkPhishing = async () => {
    setLoading(true);
    setResult(null);
    setTrustScore(null);

    let formattedUrl = url.trim().replace(/\/+$/, "");
    
    console.log("Sending request to API with URL:", formattedUrl);
    
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
      
      setResult(data.prediction);
      setTrustScore(data.trust_score !== undefined ? data.trust_score : "N/A");
      setHistory(prevHistory => [...prevHistory, { url: formattedUrl, prediction: data.prediction, trustScore: data.trust_score !== undefined ? data.trust_score : "N/A" }]);
    } catch (error) {
      console.error("Error connecting to server:", error);
      setResult("Error: Could not connect to server");
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-12 ${mode === "dark" ? "bg-gray-900 text-white" : mode === "rgb" ? "bg-rgb text-white" : "bg-gray-100 text-black"} transition-all`}>
      <div className="flex flex-col items-center w-full max-w-lg p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold tracking-wide mb-4">Phishing Website Detector</h1>
        <button
          className="p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rgb-mode:bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-90 transition font-semibold"
          onClick={toggleMode}
        >
          {mode === "light" ? "🌙 Dark Mode" : mode === "dark" ? "🌈 RGB Mode" : "☀️ Light Mode"}
        </button>
      </div>
      <div className="mt-8 w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-300">
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
          <div className="mt-2 text-gray-800 dark:text-gray-200 font-medium flex flex-col items-center">
            Trust Score:
            <div className="w-full bg-gray-300 rounded-full h-3 mt-2 overflow-hidden">
              <div
                className={`h-full ${result.toLowerCase() === "safe" ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${trustScore}%` }}
              ></div>
            </div>
            <p className="mt-2">{trustScore}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
