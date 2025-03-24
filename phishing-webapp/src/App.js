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

  useEffect(() => {
    const saved = localStorage.getItem("phishingHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("phishingHistory", JSON.stringify(history));
  }, [history]);

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

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();

      setResult(data.prediction);
      setTrustScore(data.trust_score !== undefined ? data.trust_score : "N/A");

      setHistory((prev) => [
        ...prev,
        {
          url: formattedUrl,
          prediction: data.prediction,
          trustScore: data.trust_score !== undefined ? data.trust_score : "N/A",
        },
      ]);
    } catch (error) {
      console.error("Error connecting to server:", error);
      setResult("Error: Could not connect to server");
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-12 ${mode === "dark"
          ? "bg-gray-900 text-white"
          : mode === "rgb"
            ? "bg-rgb text-white"
            : "bg-gray-100 text-black"
        } transition-all`}
    >
      <div className="flex flex-col items-center w-full max-w-lg p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-4 font-display tracking-wide">
          Phishing Website Detector
        </h1>
        <button
          className="p-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rgb-mode:bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-90 transition font-semibold"
          onClick={toggleMode}
        >
          {mode === "light"
            ? "🌙 Dark Mode"
            : mode === "dark"
              ? "🌈 RGB Mode"
              : "☀️ Light Mode"}
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
        <div
          className={`mt-6 p-6 text-lg font-semibold rounded-xl shadow-md text-center border-2 border-gray-300 w-full max-w-lg ${result.toLowerCase() === "safe"
              ? "bg-green-100 text-green-800 border-green-500"
              : "bg-red-100 text-red-800 border-red-500"
            }`}
        >
          <div className="text-2xl font-extrabold mb-2">
            {result.toLowerCase() === "safe"
              ? "✅ This website is Safe"
              : "⚠️🚨 This website might be a Phishing Website!"}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8 w-full max-w-lg p-6 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-300">
          <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2 text-gray-900 dark:text-white font-display">
            🕘 History
          </h2>
          <div className="flex flex-col gap-4 max-h-80 overflow-y-auto items-center">
            {history
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className={`history-card w-full p-5 rounded-xl border-2 font-sans text-center flex flex-col items-center ${entry.prediction.toLowerCase() === "safe"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                    }`}
                >
                  <div className="mb-2 break-words font-medium text-center">{entry.url}</div>
                  <div className="text-sm font-semibold mb-1 text-center">
                    Prediction: {entry.prediction}
                  </div>
                  <div className="text-sm font-semibold mb-2 text-center">
                    Trust Score: {entry.trustScore}%
                  </div>
                  <div className="w-4/5 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${entry.prediction.toLowerCase() === "safe"
                          ? "bg-green-500"
                          : "bg-red-500"
                        }`}
                      style={{ width: `${entry.trustScore}%` }}
                    ></div>
                  </div>
                </div>

              ))}
          </div>
        </div>
      )}
    </div>
  );
}
