const DAYS = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "G" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" }
];

const DAY_NAMES = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const SHORT_DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const scheduleList = document.getElementById("schedule-list");
const emptySchedules = document.getElementById("empty-schedules");
const scheduleMessage = document.getElementById("schedule-message");
const addScheduleButton = document.getElementById("add-schedule");
const saveSchedulesButton = document.getElementById("save-schedules");
const themeSelect = document.getElementById("theme-select");
const blockedUrlInput = document.getElementById("blocked-url-input");
const blockedUrlList = document.getElementById("blocked-url-list");
const emptyBlockedUrls = document.getElementById("empty-blocked-urls");
const blockedUrlMessage = document.getElementById("blocked-url-message");
const addBlockedUrlButton = document.getElementById("add-blocked-url");
const saveBlockedUrlsButton = document.getElementById("save-blocked-urls");
const navigationItems = [...document.querySelectorAll(".nav-item")];
const settingsViews = [...document.querySelectorAll(".settings-view")];

let schedules = [];
let blockedUrls = [];
let currentTheme = "system";

function showSettingsSection(sectionId, updateLocation = true) {
  const selectedView = settingsViews.find((view) => view.id === sectionId) || settingsViews[0];

  settingsViews.forEach((view) => {
    view.hidden = view !== selectedView;
  });

  navigationItems.forEach((item) => {
    const isActive = item.dataset.section === selectedView.id;
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  if (updateLocation) {
    history.replaceState(null, "", `#${selectedView.id}`);
  }
}

function createScheduleId() {
  return `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLucideIcon(pathData, className) {
  // Icons from Lucide, licensed under ISC: https://lucide.dev/license.
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", `schedule-icon ${className}`);
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");

  pathData.forEach((data) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", data);
    icon.append(path);
  });

  return icon;
}

function formatScheduleDays(days) {
  if (days.length === 0) {
    return "Nessun giorno";
  }

  const sortedDays = [...days].sort((first, second) => first - second);
  const key = sortedDays.join(",");

  if (key === "0,1,2,3,4,5,6") {
    return "Tutti i giorni";
  }

  if (key === "1,2,3,4,5") {
    return "Lun–Ven";
  }

  if (key === "0,6") {
    return "Weekend";
  }

  return DAYS.filter((day) => days.includes(day.value)).map((day) => SHORT_DAY_NAMES[day.value]).join(", ");
}

function formatScheduleDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return "";
  }

  const formatDate = (value, fallback) => value ? value.split("-").reverse().join("/") : fallback;

  return ` · ${formatDate(startDate, "…")}→${formatDate(endDate, "…")}`;
}

function createDayButton(day, selectedDays) {
  const label = document.createElement("label");
  label.className = "day-option";
  label.title = DAY_NAMES[day.value];

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = String(day.value);
  input.checked = selectedDays.includes(day.value);

  const text = document.createElement("span");
  text.textContent = day.label;

  label.append(input, text);

  return label;
}

function createBlockedUrlRow(value) {
  const row = document.createElement("div");
  row.className = "blocked-url-row";

  const input = document.createElement("input");
  input.className = "blocked-url-value";
  input.type = "text";
  input.inputMode = "url";
  input.value = value;
  input.setAttribute("aria-label", "Link bloccato");

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.setAttribute("aria-label", `Rimuovi ${value}`);
  remove.title = "Rimuovi link";
  remove.append(createLucideIcon(["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M10 11v6", "M14 11v6"], "trash-icon"));
  remove.addEventListener("click", () => {
    row.remove();
    updateBlockedUrlsEmptyState();
    showBlockedUrlMessage("Modifica non ancora salvata.", "info");
  });

  row.append(input, remove);

  return row;
}

function createScheduleUrlEditor(title, description, inputClass, values, suggestedValues = []) {
  const group = document.createElement("div");
  group.className = "schedule-url-group";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const help = document.createElement("p");
  help.textContent = description;

  const controls = document.createElement("div");
  controls.className = "schedule-url-controls";

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "schedule-url-input-wrapper";

  const newUrlInput = document.createElement("input");
  newUrlInput.type = "text";
  newUrlInput.inputMode = "url";
  newUrlInput.placeholder = "es. news.ycombinator.com";
  newUrlInput.setAttribute("aria-label", title);
  newUrlInput.setAttribute("autocomplete", "off");

  const suggestions = document.createElement("div");
  suggestions.className = "schedule-url-suggestions";
  suggestions.hidden = true;
  suggestions.setAttribute("role", "listbox");

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "schedule-url-add";
  addButton.setAttribute("aria-label", `Aggiungi a ${title}`);
  addButton.title = "Aggiungi link";
  addButton.append(createLucideIcon(["M12 5v14", "M5 12h14"], "plus-icon"));

  const list = document.createElement("div");
  list.className = "schedule-url-list";

  function getCurrentValues() {
    return [...list.querySelectorAll(`.${inputClass}`)].map((input) => input.value.trim());
  }

  function hideSuggestions() {
    suggestions.hidden = true;
  }

  function renderSuggestions() {
    const query = newUrlInput.value.trim().toLowerCase();
    const currentValues = new Set(getCurrentValues());
    const matchingValues = suggestedValues.filter((value) => !currentValues.has(value) && value.toLowerCase().includes(query));

    suggestions.replaceChildren();

    matchingValues.forEach((value) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "schedule-url-suggestion";
      option.textContent = value;
      option.setAttribute("role", "option");
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      option.addEventListener("click", () => {
        addRow(value);
        newUrlInput.value = "";
        hideSuggestions();
        showMessage("Modifica non ancora salvata.", "info");
      });
      suggestions.append(option);
    });

    suggestions.hidden = matchingValues.length === 0;
  }

  function addRow(value) {
    const row = document.createElement("div");
    row.className = "schedule-url-row";

    const input = document.createElement("input");
    input.className = inputClass;
    input.type = "text";
    input.inputMode = "url";
    input.value = value;
    input.setAttribute("aria-label", `${title}: link`);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "schedule-url-remove";
    remove.setAttribute("aria-label", `Rimuovi ${value}`);
    remove.title = "Rimuovi link";
    remove.append(createLucideIcon(["M18 6 6 18", "m6 6 12 12"], "x-icon"));
    remove.addEventListener("click", () => {
      row.remove();
      showMessage("Modifica non ancora salvata.", "info");
    });

    row.append(input, remove);
    list.append(row);
  }

  function addInputValue() {
    const value = newUrlInput.value.trim();

    if (!value) {
      newUrlInput.focus();
      return;
    }

    addRow(value);
    newUrlInput.value = "";
    hideSuggestions();
    showMessage("Modifica non ancora salvata.", "info");
  }

  addButton.addEventListener("click", addInputValue);
  newUrlInput.addEventListener("focus", renderSuggestions);
  newUrlInput.addEventListener("click", renderSuggestions);
  newUrlInput.addEventListener("input", renderSuggestions);
  newUrlInput.addEventListener("blur", hideSuggestions);
  newUrlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addInputValue();
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  values.forEach(addRow);
  inputWrapper.append(newUrlInput, suggestions);
  controls.append(inputWrapper, addButton);
  group.append(heading, help, controls, list);

  return group;
}

function createScheduleCard(schedule, expanded = false) {
  const card = document.createElement("article");
  card.className = "schedule-card";
  card.dataset.scheduleId = schedule.id;

  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "schedule-summary";
  summary.setAttribute("aria-expanded", String(expanded));

  const statusDot = document.createElement("span");
  statusDot.className = "schedule-status-dot";
  statusDot.setAttribute("aria-hidden", "true");

  const summaryContent = document.createElement("span");
  summaryContent.className = "schedule-summary-content";

  const summaryName = document.createElement("span");
  summaryName.className = "schedule-summary-name";

  const summaryDetails = document.createElement("span");
  summaryDetails.className = "schedule-summary-details";

  const chevron = createLucideIcon(["m7 9 5 5 5-5"], "schedule-chevron");
  summaryContent.append(summaryName, summaryDetails);
  summary.append(statusDot, summaryContent, chevron);

  const settings = document.createElement("div");
  settings.className = "schedule-settings";
  settings.hidden = !expanded;
  settings.id = `schedule-panel-${schedule.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  summary.setAttribute("aria-controls", settings.id);

  const topRow = document.createElement("div");
  topRow.className = "schedule-top-row";

  const name = document.createElement("input");
  name.className = "schedule-name";
  name.type = "text";
  name.maxLength = 80;
  name.placeholder = "Nome (opzionale)";
  name.value = schedule.name;
  name.setAttribute("aria-label", "Nome schedule");

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "enabled-toggle";
  const enabled = document.createElement("input");
  enabled.type = "checkbox";
  enabled.className = "schedule-enabled";
  enabled.checked = schedule.enabled;
  const enabledText = document.createElement("span");
  enabledText.textContent = "Attivo";
  enabledLabel.append(enabled, enabledText);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-button";
  remove.setAttribute("aria-label", "Rimuovi schedule");
  remove.title = "Rimuovi schedule";
  remove.append(createLucideIcon(["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M10 11v6", "M14 11v6"], "trash-icon"));
  remove.addEventListener("click", () => {
    card.remove();
    updateEmptyState();
    showMessage("Modifica non ancora salvata.", "info");
  });

  topRow.append(name, enabledLabel, remove);

  const days = document.createElement("div");
  days.className = "days";
  days.setAttribute("aria-label", "Giorni della settimana");
  DAYS.forEach((day) => days.append(createDayButton(day, schedule.days)));

  const timeRow = document.createElement("div");
  timeRow.className = "time-row";

  const startLabel = document.createElement("label");
  startLabel.textContent = "Dalle";
  const start = document.createElement("input");
  start.className = "schedule-start";
  start.type = "time";
  start.value = schedule.start;
  start.required = true;
  startLabel.append(start);

  const endLabel = document.createElement("label");
  endLabel.textContent = "Alle";
  const end = document.createElement("input");
  end.className = "schedule-end";
  end.type = "time";
  end.value = schedule.end;
  end.required = true;
  endLabel.append(end);

  const dateRange = document.createElement("div");
  dateRange.className = "schedule-date-range";

  const dateRangeHeading = document.createElement("div");
  dateRangeHeading.className = "schedule-field-heading";
  const dateRangeTitle = document.createElement("h3");
  dateRangeTitle.textContent = "Periodo date";
  const dateRangeHelp = document.createElement("p");
  dateRangeHelp.textContent = "Opzionale. Lascia vuoto un limite per non applicarlo.";
  dateRangeHeading.append(dateRangeTitle, dateRangeHelp);

  const dateRow = document.createElement("div");
  dateRow.className = "date-row";

  const startDateLabel = document.createElement("label");
  startDateLabel.textContent = "Dal";
  const startDate = document.createElement("input");
  startDate.className = "schedule-start-date";
  startDate.type = "date";
  startDate.value = schedule.startDate || "";
  startDateLabel.append(startDate);

  const endDateLabel = document.createElement("label");
  endDateLabel.textContent = "Al";
  const endDate = document.createElement("input");
  endDate.className = "schedule-end-date";
  endDate.type = "date";
  endDate.value = schedule.endDate || "";
  endDateLabel.append(endDate);

  dateRow.append(startDateLabel, endDateLabel);
  dateRange.append(dateRangeHeading, dateRow);

  const scheduleExceptions = document.createElement("div");
  scheduleExceptions.className = "schedule-exceptions";
  scheduleExceptions.append(
    createScheduleUrlEditor("Blocca anche", "Questi link vengono bloccati soltanto durante questo schedule.", "schedule-additional-url", schedule.additionalBlockedUrls || []),
    createScheduleUrlEditor("Non bloccare", "Questi link restano accessibili durante questo schedule.", "schedule-excluded-url", schedule.excludedBlockedUrls || [], blockedUrls)
  );

  timeRow.append(startLabel, endLabel);
  settings.append(topRow, days, timeRow, dateRange, scheduleExceptions);
  card.append(summary, settings);

  function refreshSummary() {
    const selectedDays = [...days.querySelectorAll("input:checked")].map((input) => Number(input.value));
    const enabledStatus = enabled.checked ? "Attivo" : "Disattivato";
    summaryName.textContent = name.value.trim() || "Schedule";
    summaryDetails.textContent = `${formatScheduleDays(selectedDays)} · ${start.value}–${end.value}${formatScheduleDateRange(startDate.value, endDate.value)} · ${enabledStatus}`;
    card.classList.toggle("is-disabled", !enabled.checked);
  }

  function setExpanded(isExpanded) {
    card.classList.toggle("is-open", isExpanded);
    settings.hidden = !isExpanded;
    summary.setAttribute("aria-expanded", String(isExpanded));
  }

  summary.addEventListener("click", () => {
    setExpanded(summary.getAttribute("aria-expanded") !== "true");
  });

  settings.addEventListener("input", refreshSummary);
  settings.addEventListener("change", refreshSummary);
  setExpanded(expanded);
  refreshSummary();

  return card;
}

function updateEmptyState() {
  emptySchedules.hidden = scheduleList.children.length > 0;
}

function renderSchedules() {
  scheduleList.replaceChildren();
  schedules.forEach((schedule) => scheduleList.append(createScheduleCard(schedule)));
  updateEmptyState();
}

function updateBlockedUrlsEmptyState() {
  emptyBlockedUrls.hidden = blockedUrlList.children.length > 0;
}

function renderBlockedUrls() {
  blockedUrlList.replaceChildren();
  blockedUrls.forEach((blockedUrl) => blockedUrlList.append(createBlockedUrlRow(blockedUrl)));
  updateBlockedUrlsEmptyState();
}

function showMessage(text, type) {
  scheduleMessage.textContent = text;
  scheduleMessage.className = `message ${type}`;
}

function showBlockedUrlMessage(text, type) {
  blockedUrlMessage.textContent = text;
  blockedUrlMessage.className = `message ${type}`;
}

function readSchedules() {
  return [...scheduleList.querySelectorAll(".schedule-card")].map((card) => ({
    id: card.dataset.scheduleId,
    name: card.querySelector(".schedule-name").value.trim(),
    enabled: card.querySelector(".schedule-enabled").checked,
    days: [...card.querySelectorAll(".day-option input:checked")].map((input) => Number(input.value)),
    start: card.querySelector(".schedule-start").value,
    end: card.querySelector(".schedule-end").value,
    startDate: card.querySelector(".schedule-start-date").value,
    endDate: card.querySelector(".schedule-end-date").value,
    additionalBlockedUrls: [...card.querySelectorAll(".schedule-additional-url")].map((input) => input.value.trim()),
    excludedBlockedUrls: [...card.querySelectorAll(".schedule-excluded-url")].map((input) => input.value.trim())
  }));
}

function readBlockedUrls() {
  return [...blockedUrlList.querySelectorAll(".blocked-url-value")].map((input) => input.value.trim());
}

function validateSchedules(scheduleValues) {
  for (const [index, schedule] of scheduleValues.entries()) {
    if (schedule.days.length === 0) {
      return { index, message: "Seleziona almeno un giorno per ogni schedule." };
    }

    if (!schedule.start || !schedule.end) {
      return { index, message: "Inserisci un orario di inizio e di fine." };
    }

    if (schedule.start === schedule.end) {
      return { index, message: "L'orario di inizio e fine non possono coincidere." };
    }

    if (schedule.startDate && schedule.endDate && schedule.startDate > schedule.endDate) {
      return { index, message: "La data iniziale non può essere successiva alla data finale." };
    }
  }

  return null;
}

async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ type: "GET_BLOCK_STATE" });

  if (!response?.ok) {
    showMessage(response?.error || "Impossibile caricare gli schedule.", "error");
    return;
  }

  schedules = response.state.schedules;
  blockedUrls = response.state.blockedUrls;
  currentTheme = response.state.theme;
  themeSelect.value = currentTheme;
  renderSchedules();
  renderBlockedUrls();
}

themeSelect.addEventListener("change", async () => {
  const selectedTheme = themeSelect.value;
  themeSelect.disabled = true;

  const response = await chrome.runtime.sendMessage({
    type: "SET_THEME",
    theme: selectedTheme
  });

  themeSelect.disabled = false;

  if (!response?.ok) {
    themeSelect.value = currentTheme;
    showMessage(response?.error || "Impossibile cambiare il tema.", "error");
    return;
  }

  currentTheme = selectedTheme;
});

navigationItems.forEach((item) => {
  item.addEventListener("click", () => {
    showSettingsSection(item.dataset.section);
  });
});

function addBlockedUrl() {
  const value = blockedUrlInput.value.trim();

  if (!value) {
    showBlockedUrlMessage("Inserisci un dominio o un URL.", "error");
    blockedUrlInput.focus();
    return;
  }

  blockedUrlList.append(createBlockedUrlRow(value));
  blockedUrlInput.value = "";
  updateBlockedUrlsEmptyState();
  showBlockedUrlMessage("Link aggiunto. Salva per applicare la modifica.", "info");
}

addBlockedUrlButton.addEventListener("click", addBlockedUrl);

blockedUrlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addBlockedUrl();
  }
});

saveBlockedUrlsButton.addEventListener("click", async () => {
  saveBlockedUrlsButton.disabled = true;
  showBlockedUrlMessage("Salvataggio…", "info");

  const response = await chrome.runtime.sendMessage({
    type: "SAVE_BLOCKED_URLS",
    blockedUrls: readBlockedUrls()
  });

  saveBlockedUrlsButton.disabled = false;

  if (!response?.ok) {
    showBlockedUrlMessage(response?.error || "Impossibile salvare i link.", "error");
    return;
  }

  blockedUrls = response.state.blockedUrls;
  renderBlockedUrls();
  showBlockedUrlMessage("Siti bloccati aggiornati.", "success");
});

addScheduleButton.addEventListener("click", () => {
  scheduleList.append(createScheduleCard({
    id: createScheduleId(),
    name: "",
    days: [1, 2, 3, 4, 5],
    start: "09:00",
    end: "17:00",
    startDate: "",
    endDate: "",
    enabled: true,
    additionalBlockedUrls: [],
    excludedBlockedUrls: []
  }, true));
  updateEmptyState();
  showMessage("Configura la fascia e salva le modifiche.", "info");
});

saveSchedulesButton.addEventListener("click", async () => {
  const scheduleValues = readSchedules();
  const validationError = validateSchedules(scheduleValues);

  if (validationError) {
    const invalidCard = scheduleList.children[validationError.index];
    const invalidSummary = invalidCard.querySelector(".schedule-summary");

    if (invalidSummary.getAttribute("aria-expanded") !== "true") {
      invalidSummary.click();
    }

    showMessage(validationError.message, "error");
    return;
  }

  saveSchedulesButton.disabled = true;
  showMessage("Salvataggio…", "info");

  const response = await chrome.runtime.sendMessage({
    type: "SAVE_SCHEDULES",
    schedules: scheduleValues
  });

  saveSchedulesButton.disabled = false;

  if (!response?.ok) {
    showMessage(response?.error || "Impossibile salvare gli schedule.", "error");
    return;
  }

  schedules = response.state.schedules;
  renderSchedules();
  showMessage("Modifiche salvate.", "success");
});

showSettingsSection(location.hash.slice(1) || "schedules", false);
loadSettings();
