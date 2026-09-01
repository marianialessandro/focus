const DEFAULT_STATE = {
  manualBlocked: false,
  calendarBlocked: false,
  activeEvent: null
};

export async function getBlockState() {
  const state = await chrome.storage.local.get(DEFAULT_STATE);

  return {
    ...state,
    effectiveBlocked:
      state.manualBlocked || state.calendarBlocked
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