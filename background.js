// TeleVault — background service worker
// Copyright (c) 2026 Adham Idiboyev (@SuperMix)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "openOptions") chrome.runtime.openOptionsPage();
  if (msg?.type === "notify" && msg.title) {
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;
    chrome.notifications.create(tabId != null ? `tmd-${tabId}-${windowId}-${Date.now()}` : "", {
      type: "basic",
      iconUrl: "icons/128.png",
      title: String(msg.title).slice(0, 120),
      message: String(msg.message || "").slice(0, 300),
      priority: 0
    });
  }
});

// Clicking the notification brings the Telegram tab back
chrome.notifications.onClicked.addListener((id) => {
  const m = /^tmd-(\d+)-(\d+)-/.exec(id);
  if (m) {
    chrome.tabs.update(Number(m[1]), { active: true }).catch(() => {});
    chrome.windows.update(Number(m[2]), { focused: true }).catch(() => {});
  }
  chrome.notifications.clear(id);
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
