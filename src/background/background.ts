// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Image Tools extension installed');
});

// Enable the side panel on all tabs
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Track content script readiness
const contentScriptStatus: { [tabId: number]: boolean } = {};

// Listen for messages from content script and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request, 'from sender:', sender);
  
  // Handle content script ready signal
  if (request.action === 'contentScriptReady') {
    if (sender.tab?.id) {
      contentScriptStatus[sender.tab.id] = true;
      console.log(`Content script ready for tab ${sender.tab.id}`);
    }
    return;
  }

  // Handle image request from side panel
  if (request.action === 'getImages') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]?.id) {
        sendResponse({ error: 'No active tab found' });
        return;
      }

      const tabId = tabs[0].id;
      
      // Try to communicate with content script with retries
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const response = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: 'findImages' }, (result) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          });
          
          // Success!
          sendResponse(response);
          return;
          
        } catch (error) {
          lastError = error;
          retries--;
          console.log(`Retry ${3 - retries}/3 failed:`, error);
          
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // All retries failed
      console.error('All retries failed:', lastError);
      sendResponse({ 
        error: 'Could not establish connection with the webpage. Please refresh the page and try again.',
        images: [] 
      });
    });
    
    return true; // Keep the message channel open for async response
  }
});