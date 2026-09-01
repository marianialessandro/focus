const toggleButton =
  document.getElementById("toggle-button");

const statusText =
  document.getElementById("status-text");

const statusIndicator =
  document.getElementById("status-indicator");

let manualBlocked = false;

async function loadState() {
  const response = await chrome.runtime.sendMessage({
    type: "GET_BLOCK_STATE"
  });

  if (!response?.ok) {
    console.error(
      "Failed to load extension state:",
      response?.error
    );

    return;
  }

  manualBlocked = response.state.manualBlocked;

  render();
}

function render() {
  if (manualBlocked) {
    statusText.textContent = "Blocco attivo";
    statusIndicator.textContent = "●";
    toggleButton.textContent = "Disattiva blocco";

    return;
  }

  statusText.textContent = "Blocco disattivato";
  statusIndicator.textContent = "○";
  toggleButton.textContent = "Blocca adesso";
}

toggleButton.addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({
    type: "SET_MANUAL_BLOCK",
    enabled: !manualBlocked
  });

  if (!response?.ok) {
    console.error(
      "Failed to update extension state:",
      response?.error
    );

    return;
  }

  manualBlocked = response.state.manualBlocked;

  render();
});

loadState();