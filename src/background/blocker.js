import { getBlockState } from "./state.js";

const BLOCKING_RULES = [
  {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/src/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: "||youtube.com^",
      resourceTypes: ["main_frame"]
    }
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/src/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: "||instagram.com^",
      resourceTypes: ["main_frame"]
    }
  },
  {
    id: 3,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/src/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: "||netflix.com^",
      resourceTypes: ["main_frame"]
    }
  }
];

const BLOCKING_RULE_IDS =
  BLOCKING_RULES.map((rule) => rule.id);

async function enableBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: BLOCKING_RULE_IDS,
    addRules: BLOCKING_RULES
  });
}

async function disableBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: BLOCKING_RULE_IDS
  });
}

export async function refreshBlockingState() {
  const state = await getBlockState();

  if (state.effectiveBlocked) {
    await enableBlocking();
  } else {
    await disableBlocking();
  }

  return state;
}