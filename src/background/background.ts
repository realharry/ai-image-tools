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

// Function to inject content script programmatically
async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    // First try to ping existing content script
    const response = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (result) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });

    if (response) {
      console.log('Content script already active on tab', tabId);
      return true;
    }

    // Content script not responding, inject it programmatically
    console.log('Injecting content script programmatically for tab', tabId);
    
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });

    // Wait a bit for injection to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test if injection worked
    const testResponse = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (result) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });

    if (testResponse) {
      console.log('Content script successfully injected for tab', tabId);
      contentScriptStatus[tabId] = true;
      return true;
    }

    return false;
    
  } catch (error) {
    console.error('Failed to inject content script:', error);
    return false;
  }
}

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
      const tabUrl = tabs[0].url;
      
      // Skip special pages
      if (tabUrl?.startsWith('chrome://') || tabUrl?.startsWith('chrome-extension://') || tabUrl?.startsWith('moz-extension://')) {
        sendResponse({ 
          error: 'Cannot scan browser internal pages. Please navigate to a regular webpage.',
          images: [] 
        });
        return;
      }
      
      // Ensure content script is available
      const contentScriptReady = await ensureContentScript(tabId);
      if (!contentScriptReady) {
        sendResponse({ 
          error: 'Failed to initialize content script. Please refresh the page and try again.',
          images: [] 
        });
        return;
      }
      
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
            // Wait before retrying, and try re-injecting content script
            await new Promise(resolve => setTimeout(resolve, 1000));
            await ensureContentScript(tabId);
          }
        }
      }
      
      // All retries failed
      console.error('All retries failed on tab', tabId, ':', lastError);
      sendResponse({ 
        error: 'All retries failed: ' + (lastError instanceof Error ? lastError.message : String(lastError)),
        images: [] 
      });
    });
    
    return true; // Keep the message channel open for async response
  }
});