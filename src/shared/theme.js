const VALID_THEMES = new Set(["system", "light", "dark"]);

function applyTheme(theme) {
  document.documentElement.dataset.theme = VALID_THEMES.has(theme) ? theme : "system";
}

async function loadTheme() {
  const { theme } = await chrome.storage.local.get({ theme: "system" });
  applyTheme(theme);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.theme) {
    applyTheme(changes.theme.newValue);
  }
});

loadTheme();
