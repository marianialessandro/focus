import {
  getBlockState,
  setManualBlocked
} from "./state.js";

import {
  refreshBlockingState
} from "./blocker.js";

import {
  refreshScheduleState,
  saveSchedules
} from "./schedules.js";

const SCHEDULE_ALARM = "refresh-schedules";

async function refreshSchedulesAndBlocking() {
  await refreshScheduleState();

  return refreshBlockingState();
}

async function ensureScheduleAlarm() {
  const nextMinute = Math.floor(Date.now() / 60000) * 60000 + 60000;

  await chrome.alarms.create(SCHEDULE_ALARM, {
    when: nextMinute,
    periodInMinutes: 1
  });
}

async function handleSetManualBlock(enabled) {
  await setManualBlocked(enabled);

  const state = await refreshBlockingState();

  return {
    ok: true,
    state
  };
}

async function handleGetBlockState() {
  await refreshScheduleState();

  const state = await getBlockState();

  return {
    ok: true,
    state
  };
}

async function handleSaveSchedules(schedules) {
  await saveSchedules(schedules);

  const state = await refreshBlockingState();

  return {
    ok: true,
    state
  };
}

chrome.runtime.onInstalled.addListener(() => {
  ensureScheduleAlarm().then(refreshSchedulesAndBlocking).catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  ensureScheduleAlarm().then(refreshSchedulesAndBlocking).catch(console.error);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SCHEDULE_ALARM) {
    refreshSchedulesAndBlocking().catch(console.error);
  }
});

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    switch (message.type) {
      case "SET_MANUAL_BLOCK":
        handleSetManualBlock(message.enabled)
          .then(sendResponse)
          .catch((error) => {
            console.error(error);

            sendResponse({
              ok: false,
              error: error.message
            });
          });

        return true;

      case "GET_BLOCK_STATE":
        handleGetBlockState()
          .then(sendResponse)
          .catch((error) => {
            console.error(error);

            sendResponse({
              ok: false,
              error: error.message
            });
          });

        return true;

      case "SAVE_SCHEDULES":
        handleSaveSchedules(message.schedules)
          .then(sendResponse)
          .catch((error) => {
            console.error(error);

            sendResponse({
              ok: false,
              error: error.message
            });
          });

        return true;

      default:
        return false;
    }
  }
);

ensureScheduleAlarm().then(refreshSchedulesAndBlocking).catch(console.error);
