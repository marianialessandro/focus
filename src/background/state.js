const DEFAULT_STATE = {
  manualBlocked: false,
  calendarBlocked: false,
  activeEvent: null,
  schedules: [],
  scheduleBlocked: false,
  activeSchedule: null,
  theme: "system"
};

export async function getBlockState() {
  const state = await chrome.storage.local.get(DEFAULT_STATE);

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

export async function setScheduleBlocked(enabled, activeSchedule = null) {
  await chrome.storage.local.set({
    scheduleBlocked: Boolean(enabled),
    activeSchedule
  });
}

export async function setTheme(theme) {
  if (!["system", "light", "dark"].includes(theme)) {
    throw new Error("Tema non valido.");
  }

  await chrome.storage.local.set({ theme });
}
