import type { ImageInfo } from '@/types';

// Function to find all images on the page
function findImages(): ImageInfo[] {
  const images = document.querySelectorAll('img');
  const imageInfos: ImageInfo[] = [];

  images.forEach((img, index) => {
    // Skip very small images (likely icons, etc.)
    if (img.naturalWidth < 50 || img.naturalHeight < 50) {
      return;
    }

    // Skip images that are not visible
    const rect = img.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    imageInfos.push({
      src: img.src,
      alt: img.alt || `Image ${index + 1}`,
      width: rect.width,
      height: rect.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    });
  });

  return imageInfos;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'findImages') {
    const images = findImages();
    sendResponse({ images });
  }
});

// Also send images immediately when content script loads
window.addEventListener('load', () => {
  setTimeout(() => {
    const images = findImages();
    chrome.runtime.sendMessage({ action: 'imagesFound', images });
  }, 1000);
});