document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url = tab.url.trim().replace(/\/+$/, ""); 
    document.getElementById('currentUrl').textContent = url;
  
    document.getElementById('checkBtn').addEventListener('click', async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
          
  
        const data = await res.json();
        document.getElementById('result').textContent = 
          `⚠️ This site is: ${data.prediction} (Trust Score: ${data.trust_score}%)`;
      } catch (error) {
        document.getElementById('result').textContent = "🚫 Error connecting to detection server.";
        console.error(error);
      }
    });
  });
  