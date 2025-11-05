/**
 * SmartWrite AI - Welcome Page Script
 */
const apiKeyInput = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const skipBtn = document.getElementById("skipBtn");
const status = document.getElementById("status");

// Focus on input
if (apiKeyInput) {
  apiKeyInput.focus();
}

// Save button handler
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus("Please enter an API key", "error");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      await chrome.storage.local.set({
        geminiApiKey: apiKey,
        setupCompleted: true,
      });
      showStatus("✓ Setup completed successfully!", "success");
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      showStatus("Failed to save API key. Please try again.", "error");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save & Continue";
    }
  });
}

// Skip button handler
if (skipBtn) {
  skipBtn.addEventListener("click", async () => {
    skipBtn.disabled = true;
    skipBtn.textContent = "Skipping...";

    try {
      await chrome.storage.local.set({ setupCompleted: true });
      showStatus("✓ Setup skipped. You can add API key later from settings.", "success");
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      showStatus("Failed to skip setup. Please try again.", "error");
      skipBtn.disabled = false;
      skipBtn.textContent = "Skip for Now";
    }
  });
}

// Enter key to save
if (apiKeyInput) {
  apiKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveBtn.click();
    }
  });
}

function showStatus(message, type) {
  if (status) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = "block";
  }
}
