(async function () {
    const currentUrl = window.location.href.trim().replace(/\/+$/, "");
  
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl })
      });
  
      const data = await response.json();
  
      if (data.prediction === "Phishing") {
        showBanner(`⚠️ WARNING: This site is likely a phishing site! Trust Score: ${data.trust_score}%`, "#dc2626", false);
      } else if (data.prediction === "Safe") {
        showBanner(`✅ This site is safe. Trust Score: ${data.trust_score}%`, "#16a34a", true);
      }
    } catch (error) {
      console.error("Phishing check failed:", error);
    }
  
    // Function to inject the banner
    function showBanner(text, bgColor, autoDismiss = false) {
      const banner = document.createElement('div');
      banner.innerText = text;
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.width = '100%';
      banner.style.zIndex = '9999';
      banner.style.backgroundColor = bgColor;
      banner.style.color = 'white';
      banner.style.fontWeight = 'bold';
      banner.style.padding = '12px';
      banner.style.textAlign = 'center';
      banner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      banner.style.fontFamily = 'Arial, sans-serif';
      banner.style.fontSize = '16px';
  
      document.body.appendChild(banner);
  
      if (autoDismiss) {
        setTimeout(() => {
          banner.remove();
        }, 5000); // remove after 5 seconds
      }
    }
  })();
  