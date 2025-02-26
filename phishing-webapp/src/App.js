import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPhishing = async () => {
    setLoading(true);
    setResult(null);

    // Remove trailing slash if present
    let formattedUrl = url.trim().replace(/\/+$/, "");
    
    console.log("Sending request to API with URL:", formattedUrl);
    debugger; // Debugger statement for inspection
    
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }), // Send formatted URL
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      debugger; // Debugger statement to inspect API response
      
      setResult(data.prediction);
    } catch (error) {
      console.error("Error connecting to server:", error);
      setResult("Error: Could not connect to server");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Phishing Website Detector</h1>
      <input
        type="text"
        placeholder="Enter website URL..."
        className="border rounded-lg p-2 w-80 mb-4"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={checkPhishing}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check URL"}
      </button>
      {result && (
        <div
          className={`mt-4 p-3 text-lg font-semibold rounded-lg ${
            result.toLowerCase() === "safe" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
          }`}
        >
          {result.toLowerCase() === "safe" ? "✅ This website is Safe" : "🚨 This website is Phishing!"}
        </div>
      )}
    </div>
  );
}
