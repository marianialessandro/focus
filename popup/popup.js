const toggleButton = document.getElementById("toggle-button");
const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");

let manualBlocked = false;

async function loadState() {
  const result = await chrome.storage.local.get({
    manualBlocked: false
  });

  manualBlocked = result.manualBlocked;

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
  manualBlocked = !manualBlocked;

  await chrome.runtime.sendMessage({
    type: "SET_MANUAL_BLOCK",
    enabled: manualBlocked
  });

  render();
});

loadState();