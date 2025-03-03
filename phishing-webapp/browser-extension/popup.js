document.addEventListener("DOMContentLoaded", function () {
    const urlInput = document.getElementById("urlInput");
    const safeButton = document.getElementById("safeButton");
    const phishingButton = document.getElementById("phishingButton");
    const status = document.getElementById("status");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            urlInput.value = tabs[0].url;
        }
    });

    function submitReport(label) {
        const url = urlInput.value.trim();
        if (!url) {
            status.textContent = "❌ Enter a valid URL!";
            return;
        }

        fetch("http://127.0.0.1:5000/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url, label: label })
        })
        .then(response => response.json())
        .then(data => {
            status.textContent = `✅ ${data.message}`;
        })
        .catch(error => {
            status.textContent = "❌ Error sending data.";
        });
    }

    safeButton.addEventListener("click", () => submitReport("safe"));
    phishingButton.addEventListener("click", () => submitReport("phishing"));
});
