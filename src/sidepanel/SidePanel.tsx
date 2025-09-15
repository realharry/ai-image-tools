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
  const [error, setError] = useState<string>('');

  const loadImages = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Try to send message with retries
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'findImages' });
          
          if (response && response.images) {
            setImages(response.images);
            // Clear selection if the previously selected image is no longer available
            if (selectedImage && !response.images.find((img: ImageInfo) => img.src === selectedImage.src)) {
              setSelectedImage(null);
            }
            return; // Success!
          } else {
            setImages([]);
            return;
          }
        } catch (messageError) {
          lastError = messageError;
          retries--;
          
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // All retries failed
      throw lastError;
      
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Unable to scan for images. Please refresh the webpage and try again.');
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

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <ImageList
        images={images}
        selectedImage={selectedImage}
        onSelectImage={handleSelectImage}
      />

      <ImageProcessor selectedImage={selectedImage} />
    </div>
  );
}