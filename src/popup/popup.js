const toggleButton = document.getElementById("toggle-button");
const settingsButton = document.getElementById("settings-button");
const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");
const manualLockMessage = document.getElementById("manual-lock-message");

let blockState = {
  manualBlocked: false,
  calendarBlocked: false,
  scheduleBlocked: false,
  effectiveBlocked: false,
  activeSchedule: null
};

function getScheduleName(schedule) {
  if (!schedule) {
    return "fascia programmata";
  }

  return schedule.name || `${schedule.start}–${schedule.end}`;
}

function render() {
  statusIndicator.classList.toggle("is-active", blockState.effectiveBlocked);
  statusIndicator.textContent = blockState.effectiveBlocked ? "●" : "○";

  if (blockState.scheduleBlocked) {
    statusText.textContent = `Schedule attivo: ${getScheduleName(blockState.activeSchedule)}`;
    toggleButton.textContent = "Blocco gestito dallo schedule";
    toggleButton.disabled = true;
    manualLockMessage.hidden = false;
    return;
  }

  toggleButton.disabled = false;
  manualLockMessage.hidden = true;

  if (blockState.manualBlocked) {
    statusText.textContent = "Blocco manuale attivo";
    toggleButton.textContent = "Disattiva blocco manuale";
    return;
  }

  if (blockState.calendarBlocked) {
    statusText.textContent = "Blocco calendario attivo";
  } else {
    statusText.textContent = "Blocco disattivato";
  }

  toggleButton.textContent = "Blocca adesso";
}

async function loadState() {
  const response = await chrome.runtime.sendMessage({ type: "GET_BLOCK_STATE" });

  if (!response?.ok) {
    statusText.textContent = response?.error || "Impossibile caricare lo stato.";
    toggleButton.disabled = true;
    return;
  }

  blockState = response.state;
  render();
}

toggleButton.addEventListener("click", async () => {
  if (blockState.scheduleBlocked) {
    return;
  }

  toggleButton.disabled = true;

  const response = await chrome.runtime.sendMessage({
    type: "SET_MANUAL_BLOCK",
    enabled: !blockState.manualBlocked
  });

  if (!response?.ok) {
    statusText.textContent = response?.error || "Impossibile aggiornare il blocco.";
    toggleButton.disabled = false;
    return;
  }

  blockState = response.state;
  render();
});

settingsButton.addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("src/options/options.html")
  });
});

loadState();
