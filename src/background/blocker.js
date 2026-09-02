import { getBlockState } from "./state.js";

import {
  getDefaultBlockedUrls,
  getUrlsForListIds
} from "./blocked-sites.js";

function createUrlFilter(url) {
  return `||${url}${url.includes("/") || url.includes("?") ? "" : "^"}`;
}

export function getScheduleUrlRules(activeSchedules, siteLists) {
  const additionalBlockedUrls = new Set();
  const excludedBlockedUrls = new Set();

  activeSchedules.forEach((schedule) => {
    getUrlsForListIds(siteLists, schedule.siteListIds || []).forEach((url) => additionalBlockedUrls.add(url));
    schedule.additionalBlockedUrls.forEach((url) => additionalBlockedUrls.add(url));
    schedule.excludedBlockedUrls.forEach((url) => excludedBlockedUrls.add(url));
  });

  return {
    additionalBlockedUrls: [...additionalBlockedUrls],
    excludedBlockedUrls: [...excludedBlockedUrls]
  };
}

export function createBlockingRules(blockedUrls, allowedUrls = []) {
  const redirectRules = [...new Set(blockedUrls)].map((blockedUrl, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/src/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: createUrlFilter(blockedUrl),
      resourceTypes: ["main_frame"]
    }
  }));

  const allowRules = [...new Set(allowedUrls)].map((allowedUrl, index) => ({
    id: redirectRules.length + index + 1,
    priority: 2,
    action: {
      type: "allow"
    },
    condition: {
      urlFilter: createUrlFilter(allowedUrl),
      resourceTypes: ["main_frame"]
    }
  }));

  return [...redirectRules, ...allowRules];
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
  let blockedUrls = getDefaultBlockedUrls(state.siteLists);
  let allowedUrls = [];

  if (state.scheduleBlocked) {
    const scheduleUrlRules = getScheduleUrlRules(state.activeSchedules, state.siteLists);
    blockedUrls = scheduleUrlRules.additionalBlockedUrls;
    allowedUrls = scheduleUrlRules.excludedBlockedUrls;
  }

  const blockingRules = state.effectiveBlocked ? createBlockingRules(blockedUrls, allowedUrls) : [];

  await replaceBlockingRules(blockingRules);

  return state;
}
