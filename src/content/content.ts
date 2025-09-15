import type { ImageInfo } from '@/types';

// Log when content script loads
console.log('AI Image Tools content script loaded on:', window.location.href);

// Track if the script has been initialized
let isInitialized = false;

// Function to find all images on the page
function findImages(): ImageInfo[] {
  console.log('Finding images on page...');
  const images = document.querySelectorAll('img');
  const imageInfos: ImageInfo[] = [];

  images.forEach((img, index) => {
    try {
      // Skip images that don't have a source
      if (!img.src || img.src === '') {
        console.log(`Skipping image ${index} with no src`);
        return;
      }

      // For images that haven't loaded, we can still get some info
      let naturalWidth = img.naturalWidth;
      let naturalHeight = img.naturalHeight;
      
      // If image hasn't loaded but has width/height attributes, use those
      if (naturalWidth === 0 && naturalHeight === 0) {
        naturalWidth = img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : 0;
        naturalHeight = img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : 0;
      }

      // Skip very small images (likely icons, etc.) only if we have dimensions
      if (naturalWidth > 0 && naturalHeight > 0 && (naturalWidth < 50 || naturalHeight < 50)) {
        console.log(`Skipping small image ${index}, dimensions:`, naturalWidth, 'x', naturalHeight);
        return;
      }

      // Get current display dimensions
      const rect = img.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(img);
      
      // Skip images that are completely hidden
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        console.log(`Skipping hidden image ${index} (CSS hidden)`);
        return;
      }

      // Include images even if they have 0 rect dimensions (might be loading)
      const imageInfo = {
        src: img.src,
        alt: img.alt || `Image ${index + 1}`,
        width: Math.round(rect.width) || naturalWidth || 0,
        height: Math.round(rect.height) || naturalHeight || 0,
        naturalWidth: naturalWidth,
        naturalHeight: naturalHeight,
      };

      console.log(`Found image ${index}:`, imageInfo);
      imageInfos.push(imageInfo);
      
    } catch (error) {
      console.error(`Error processing image ${index}:`, error);
    }
  });

  console.log(`Total images found: ${imageInfos.length}`);
  return imageInfos;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request, 'from:', sender);
  
  if (request.action === 'ping') {
    console.log('Responding to ping with ready status');
    sendResponse({ status: 'ready' });
    return true;
  }
  
  if (request.action === 'findImages') {
    try {
      const images = findImages();
      const response = { images };
      console.log('Sending response:', response);
      sendResponse(response);
    } catch (error) {
      console.error('Error in findImages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ images: [], error: errorMessage });
    }
    return true; // Keep the message channel open for async response
  }

  return false;
});

// Function to signal readiness to background script
function signalReady() {
  if (!isInitialized) {
    isInitialized = true;
    console.log('Signaling readiness to background script...');
    chrome.runtime.sendMessage({ action: 'contentScriptReady', url: window.location.href })
      .then(() => console.log('Successfully signaled readiness to background script'))
      .catch(error => console.log('Failed to send ready signal:', error));
  }
}

// Function to wait for images to load
function waitForImagesToLoad(): Promise<void> {
  return new Promise((resolve) => {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    let totalImages = images.length;

    if (totalImages === 0) {
      console.log('No images found on page');
      resolve();
      return;
    }

    const checkComplete = () => {
      loadedCount++;
      console.log(`Image loaded: ${loadedCount}/${totalImages}`);
      
      if (loadedCount >= totalImages) {
        console.log('All images finished loading (or failed)');
        resolve();
      }
    };

    images.forEach((img, index) => {
      if (img.complete) {
        console.log(`Image ${index} already loaded`);
        checkComplete();
      } else {
        console.log(`Waiting for image ${index} to load:`, img.src);
        img.addEventListener('load', () => {
          console.log(`Image ${index} loaded successfully`);
          checkComplete();
        });
        img.addEventListener('error', () => {
          console.log(`Image ${index} failed to load`);
          checkComplete();
        });
        
        // Timeout after 5 seconds per image
        setTimeout(() => {
          console.log(`Image ${index} load timeout`);
          checkComplete();
        }, 5000);
      }
    });
  });
}

// Initialize the content script
async function initialize() {
  console.log('Content script initializing...');
  
  // Signal readiness immediately
  signalReady();
  
  try {
    // Wait for images to load with a reasonable timeout
    const loadTimeout = new Promise(resolve => setTimeout(resolve, 3000)); // 3 second max wait
    const imageLoad = waitForImagesToLoad();
    
    await Promise.race([loadTimeout, imageLoad]);
    
    console.log('Content script initialization complete');
    
    // Send initial image data if there are images
    const initialImages = findImages();
    if (initialImages.length > 0) {
      chrome.runtime.sendMessage({ action: 'imagesFound', images: initialImages })
        .catch(error => console.log('Failed to send initial images:', error));
    }
    
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// Initialize based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM already loaded
  initialize();
}

// Also initialize on window load as a fallback
window.addEventListener('load', () => {
  if (!isInitialized) {
    console.log('Fallback initialization on window load');
    setTimeout(initialize, 500);
  }
});

// Signal ready immediately if document is already complete
if (document.readyState === 'complete') {
  setTimeout(() => {
    if (!isInitialized) {
      console.log('Document already complete, initializing immediately');
      initialize();
    }
  }, 100);
}