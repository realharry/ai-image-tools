import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageList } from '@/components/image/ImageList';
import { ImageProcessor } from '@/components/image/ImageProcessor';
import { RefreshCw, Zap } from 'lucide-react';
import type { ImageInfo } from '@/types';

export function SidePanel() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        // Send message to content script to find images
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'findImages' });
        
        if (response && response.images) {
          setImages(response.images);
          // Clear selection if the previously selected image is no longer available
          if (selectedImage && !response.images.find((img: ImageInfo) => img.src === selectedImage.src)) {
            setSelectedImage(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleSelectImage = (image: ImageInfo) => {
    setSelectedImage(image);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Image Tools
          </CardTitle>
          <CardDescription>
            Manipulate images from the current webpage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadImages} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Refresh Images'}
          </Button>
        </CardContent>
      </Card>

      <ImageList
        images={images}
        selectedImage={selectedImage}
        onSelectImage={handleSelectImage}
      />

      <ImageProcessor selectedImage={selectedImage} />
    </div>
  );
}