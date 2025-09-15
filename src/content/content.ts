import type { ImageInfo } from '@/types';

// Log when content script loads
console.log('AI Image Tools content script loaded on:', window.location.href);

// Function to find all images on the page
function findImages(): ImageInfo[] {
  console.log('Finding images on page...');
  const images = document.querySelectorAll('img');
  const imageInfos: ImageInfo[] = [];

  images.forEach((img, index) => {
    // Wait for images to load if they haven't yet
    if (!img.complete) {
      console.log(`Image ${index} not loaded yet, src:`, img.src);
      return;
    }

    // Skip very small images (likely icons, etc.)
    if (img.naturalWidth < 50 || img.naturalHeight < 50) {
      console.log(`Skipping small image ${index}, dimensions:`, img.naturalWidth, 'x', img.naturalHeight);
      return;
    }

    // Skip images that are not visible
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.log(`Skipping hidden image ${index}`);
      return;
    }

    const imageInfo = {
      src: img.src,
      alt: img.alt || `Image ${index + 1}`,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };

    console.log(`Found image ${index}:`, imageInfo);
    imageInfos.push(imageInfo);
  });

  console.log(`Total images found: ${imageInfos.length}`);
  return imageInfos;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request, 'from:', sender);
  
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
});

// Initialize when DOM is ready
function initialize() {
  console.log('Content script initializing...');
  
  // Wait for all images to load, then send initial data
  let loadedImages = 0;
  const allImages = document.querySelectorAll('img');
  
  if (allImages.length === 0) {
    console.log('No images found on page');
    return;
  }

  const checkAllLoaded = () => {
    loadedImages++;
    console.log(`Image loaded: ${loadedImages}/${allImages.length}`);
    
    if (loadedImages >= allImages.length) {
      setTimeout(() => {
        console.log('All images loaded, sending initial data...');
        const images = findImages();
        chrome.runtime.sendMessage({ action: 'imagesFound', images });
      }, 100);
    }
  };

  allImages.forEach((img) => {
    if (img.complete) {
      checkAllLoaded();
    } else {
      img.addEventListener('load', checkAllLoaded);
      img.addEventListener('error', checkAllLoaded); // Count errors as "loaded" too
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also initialize on window load as a fallback
window.addEventListener('load', () => {
  setTimeout(initialize, 1000);
});