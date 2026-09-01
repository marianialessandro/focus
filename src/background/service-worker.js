import {
  getBlockState,
  setManualBlocked
} from "./state.js";

import {
  refreshBlockingState
} from "./blocker.js";

async function handleSetManualBlock(enabled) {
  await setManualBlocked(enabled);

  const state = await refreshBlockingState();

  return {
    ok: true,
    state
  };
}

async function handleGetBlockState() {
  const state = await getBlockState();

  return {
    ok: true,
    state
  };
}

chrome.runtime.onInstalled.addListener(() => {
  refreshBlockingState().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  refreshBlockingState().catch(console.error);
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

      default:
        return false;
    }
  }
);