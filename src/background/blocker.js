import { getBlockState } from "./state.js";

export function createBlockingRules(blockedUrls) {
  return blockedUrls.map((blockedUrl, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/src/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: `||${blockedUrl}${blockedUrl.includes("/") || blockedUrl.includes("?") ? "" : "^"}`,
      resourceTypes: ["main_frame"]
    }
  }));
}

async function replaceBlockingRules(blockingRules) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRules.map((rule) => rule.id),
    addRules: blockingRules
  });
}

export async function refreshBlockingState() {
  const state = await getBlockState();
  const blockingRules = state.effectiveBlocked ? createBlockingRules(state.blockedUrls) : [];

  await replaceBlockingRules(blockingRules);

  return state;
}
