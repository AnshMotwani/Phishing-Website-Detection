document.addEventListener('DOMContentLoaded', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let rawUrl = tab.url.trim();

  function truncateToThreeSlashes(url) {
    let parts = url.split('/');
    return parts.slice(0, 3).join('/');
  }

  let cleanedUrl = truncateToThreeSlashes(rawUrl);
  document.getElementById('currentUrl').textContent = cleanedUrl;
  let lastCheckedUrl = cleanedUrl;

  async function checkUrl(url) {
    try {
      const res = await fetch('http://192.168.0.45:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      const data = await res.json();

      if (data && data.prediction) {
        const trust = data.trust_score !== undefined ? `${data.trust_score}%` : "N/A";

        let prefix = "";
        if (data.source === "user") {
          prefix = "📌 User-reported:";
        } else if (data.prediction === "Safe") {
          prefix = "✅ This site is Safe:";
        } else if (data.prediction === "Phishing") {
          prefix = "🚨 Warning! This site may be Phishing:";
        } else {
          prefix = "ℹ️ Result:";
        }

        document.getElementById('result').textContent =
          `${prefix} ${data.prediction} (Trust Score: ${trust})`;

        document.getElementById('feedbackSection').style.display = 'block';
        lastCheckedUrl = url;
      } else {
        document.getElementById('result').textContent = "⚠️ Unexpected server response.";
      }
    } catch (error) {
      document.getElementById('result').textContent = "🚫 Error connecting to detection server.";
      console.error(error);
    }
  }

  document.getElementById('checkBtn').addEventListener('click', () => {
    const toggle = document.getElementById('toggleCustomURL').checked;

    if (toggle) {
      const customUrlInput = document.getElementById('customUrlInput');
      const customUrl = customUrlInput.value.trim();

      try {
        new URL(customUrl);
        const truncatedCustomUrl = truncateToThreeSlashes(customUrl);
        checkUrl(truncatedCustomUrl);
      } catch (error) {
        document.getElementById('result').textContent = "❌ Invalid URL. Please enter a valid URL.";
      }
    } else {
      checkUrl(cleanedUrl);
    }
  });

  document.getElementById('toggleCustomURL').addEventListener('change', (e) => {
    const customSection = document.getElementById('customUrlSection');
    customSection.style.display = e.target.checked ? "flex" : "none";
  });

  document.getElementById('reportToggleBtn').addEventListener('click', () => {
    const followUp = document.getElementById('feedbackFollowUp');
    followUp.style.display = followUp.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('reportSafe').addEventListener('click', () => {
    sendFeedback("safe");
  });

  document.getElementById('reportPhishing').addEventListener('click', () => {
    sendFeedback("phishing");
  });

  function sendFeedback(label) {
    fetch("http://192.168.0.45:5000/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: lastCheckedUrl, label })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById('reportStatus').textContent = `📬 ${data.message}`;
      })
      .catch(err => {
        document.getElementById('reportStatus').textContent = "❌ Could not send feedback.";
        console.error(err);
      });
  }
});
