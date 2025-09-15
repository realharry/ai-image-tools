// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Image Tools extension installed');
});

// Enable the side panel on all tabs
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getImages') {
    // Forward request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'findImages' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});