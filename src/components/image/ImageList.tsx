import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Check } from 'lucide-react';
import type { ImageInfo } from '@/types';

interface ImageListProps {
  images: ImageInfo[];
  selectedImage: ImageInfo | null;
  onSelectImage: (image: ImageInfo) => void;
}

export function ImageList({ images, selectedImage, onSelectImage }: ImageListProps) {
  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Page Images
          </CardTitle>
          <CardDescription>
            No images found on the current page. Make sure the page has loaded completely.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Page Images ({images.length})
        </CardTitle>
        <CardDescription>
          Select an image to start processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted ${
                selectedImage?.src === image.src ? 'bg-muted border-primary' : ''
              }`}
              onClick={() => onSelectImage(image)}
            >
              <div className="flex-shrink-0">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-12 h-12 object-cover rounded border"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {image.alt || `Image ${index + 1}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {image.naturalWidth} × {image.naturalHeight} px
                </div>
              </div>
              {selectedImage?.src === image.src && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}