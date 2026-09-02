const INITIAL_BLOCKED_URLS = ["youtube.com", "instagram.com", "netflix.com"];

const DEFAULT_STATE = {
  manualBlocked: false,
  calendarBlocked: false,
  activeEvent: null,
  schedules: [],
  scheduleBlocked: false,
  activeSchedule: null,
  activeSchedules: [],
  theme: "system",
  blockedUrls: INITIAL_BLOCKED_URLS,
  siteLists: null
};

export async function getBlockState() {
  const storedState = await chrome.storage.local.get();
  const state = {
    ...DEFAULT_STATE,
    ...storedState
  };

  if (!Array.isArray(storedState.siteLists)) {
    state.siteLists = [{
      id: "default",
      name: "Default",
      urls: Array.isArray(storedState.blockedUrls) ? storedState.blockedUrls : INITIAL_BLOCKED_URLS,
      isDefault: true
    }];
  }

  state.blockedUrls = [...new Set(state.siteLists.filter((siteList) => siteList.isDefault).flatMap((siteList) => siteList.urls))];

  return {
    ...state,
    effectiveBlocked:
      state.manualBlocked || state.calendarBlocked || state.scheduleBlocked
  };
}

export async function setManualBlocked(enabled) {
  await chrome.storage.local.set({
    manualBlocked: Boolean(enabled)
  });
}

export async function setCalendarBlocked(enabled, activeEvent = null) {
  await chrome.storage.local.set({
    calendarBlocked: Boolean(enabled),
    activeEvent
  });
}

export async function setSchedules(schedules) {
  await chrome.storage.local.set({ schedules });
}

export async function setScheduleBlocked(enabled, activeSchedule = null, activeSchedules = []) {
  await chrome.storage.local.set({
    scheduleBlocked: Boolean(enabled),
    activeSchedule,
    activeSchedules
  });
}

export async function setTheme(theme) {
  if (!["system", "light", "dark"].includes(theme)) {
    throw new Error("Tema non valido.");
  }

  await chrome.storage.local.set({ theme });
}

export async function setSiteLists(siteLists) {
  await chrome.storage.local.set({ siteLists });
}
