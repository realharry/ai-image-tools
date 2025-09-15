import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageList } from '@/components/image/ImageList';
import { ImageProcessor } from '@/components/image/ImageProcessor';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
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
      console.log('Side panel requesting images...');
      
      // Use background script to mediate communication
      const response = await chrome.runtime.sendMessage({ action: 'getImages' });
      console.log('Side panel received response:', response);
      
      if (response && response.images) {
        setImages(response.images);
        // Clear selection if the previously selected image is no longer available
        if (selectedImage && !response.images.find((img: ImageInfo) => img.src === selectedImage.src)) {
          setSelectedImage(null);
        }
        
        // Show success message if images found
        if (response.images.length > 0) {
          console.log(`Successfully found ${response.images.length} images`);
        } else {
          setError('No images found on this page. The page may not have any images, or they may be too small to process.');
        }
        
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        setImages([]);
        setError('No response received from the extension. This may be a temporary issue.');
      }
      
    } catch (error) {
      console.error('Error loading images:', error);
      
      let errorMessage = 'Unable to scan for images. ';
      if (error instanceof Error) {
        if (error.message.includes('Could not establish connection')) {
          errorMessage += 'The webpage content script is not responding. Please refresh the webpage and try again.';
        } else if (error.message.includes('Cannot scan browser internal pages')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to initialize content script')) {
          errorMessage += 'Content script failed to initialize. Please refresh the webpage and try again.';
        } else if (error.message.includes('All retries failed')) {
          errorMessage += 'All connection attempts failed. Please refresh the webpage and try again.';
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
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
                {error.includes('refresh') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: Make sure you're on a regular webpage (not chrome:// or extension pages)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && images.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              No images detected on this page. Navigate to a webpage with images and click "Refresh Images".
            </p>
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