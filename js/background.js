/**
 * SmartWrite AI - Background Service Worker
 * Handles extension installation and lifecycle events
 */

// Email service domains where extension is active
const EMAIL_DOMAINS = [
  'mail.google.com',
  'outlook.com',
  'live.com',
  'mail.yahoo.com'
];

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First-time installation: open setup page
    const result = await chrome.storage.local.get(['setupCompleted']);
    if (!result.setupCompleted) {
      chrome.tabs.create({ url: 'welcome.html' });
    }
  }
  
  // Disable icon by default
  chrome.action.disable();
});

// Enable/disable icon based on current tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateIconState(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateIconState(tab);
  }
});

function updateIconState(tab) {
  if (!tab.url) return;
  
  const isEmailSite = EMAIL_DOMAINS.some(domain => 
    tab.url.includes(domain)
  );
  
  if (isEmailSite) {
    chrome.action.enable(tab.id);
  } else {
    chrome.action.disable(tab.id);
  }
}
