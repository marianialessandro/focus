const BLOCKING_RULES = [
  {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/blocked/blocked.html"
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
        extensionPath: "/blocked/blocked.html"
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
        extensionPath: "/blocked/blocked.html"
      }
    },
    condition: {
      urlFilter: "||netflix.com^",
      resourceTypes: ["main_frame"]
    }
  }
];

const RULE_IDS = BLOCKING_RULES.map((rule) => rule.id);

async function enableBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: RULE_IDS,
    addRules: BLOCKING_RULES
  });
}

async function disableBlocking() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: RULE_IDS
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SET_MANUAL_BLOCK") {
    const enabled = message.enabled;

    chrome.storage.local.set({
      manualBlocked: enabled
    });

    if (enabled) {
      return enableBlocking();
    }

    return disableBlocking();
  }
});