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
      // Use background script to mediate communication
      const response = await chrome.runtime.sendMessage({ action: 'getImages' });
      
      if (response && response.images) {
        setImages(response.images);
        // Clear selection if the previously selected image is no longer available
        if (selectedImage && !response.images.find((img: ImageInfo) => img.src === selectedImage.src)) {
          setSelectedImage(null);
        }
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        setImages([]);
      }
      
    } catch (error) {
      console.error('Error loading images:', error);
      
      let errorMessage = 'Unable to scan for images. ';
      if (error instanceof Error) {
        if (error.message.includes('Could not establish connection')) {
          errorMessage += 'The page content script is not responding. Please refresh the webpage and try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please refresh the webpage and try again.';
      }
      
      setError(errorMessage);
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