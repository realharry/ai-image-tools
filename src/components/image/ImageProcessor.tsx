import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Crop, RotateCw, FileImage } from 'lucide-react';
import type { ImageInfo, ImageFormat } from '@/types';
import { resizeImage, cropImage, convertImageFormat } from '@/lib/utils';

interface ImageProcessorProps {
  selectedImage: ImageInfo | null;
}

export function ImageProcessor({ selectedImage }: ImageProcessorProps) {
  const [resizeWidth, setResizeWidth] = useState<number>(300);
  const [resizeHeight, setResizeHeight] = useState<number>(300);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(200);
  const [cropHeight, setCropHeight] = useState<number>(200);
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('png');
  const [processing, setProcessing] = useState<boolean>(false);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const processImage = async (operation: 'resize' | 'crop' | 'convert') => {
    if (!selectedImage) return;

    setProcessing(true);
    try {
      const img = await loadImage(selectedImage.src);
      let canvas: HTMLCanvasElement;

      switch (operation) {
        case 'resize':
          canvas = resizeImage(img, resizeWidth, resizeHeight);
          break;
        case 'crop':
          canvas = cropImage(img, cropX, cropY, cropWidth, cropHeight);
          break;
        case 'convert':
          canvas = convertImageFormat(img);
          break;
        default:
          throw new Error('Invalid operation');
      }

      setProcessedCanvas(canvas);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Make sure the image is accessible.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedCanvas || !selectedImage) return;

    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const filename = `processed_${Date.now()}.${extension}`;
    
    // Convert canvas to blob with the specified format
    processedCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, `image/${outputFormat}`, 0.9);
  };

  if (!selectedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Image Processor
          </CardTitle>
          <CardDescription>
            Select an image from the list above to start processing
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-5 w-5" />
            Resize Image
          </CardTitle>
          <CardDescription>
            Resize the selected image to specific dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                value={resizeWidth}
                onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)}
                min="1"
                max="5000"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                value={resizeHeight}
                onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)}
                min="1"
                max="5000"
              />
            </div>
          </div>
          <Button 
            onClick={() => processImage('resize')} 
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Resize Image'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Image
          </CardTitle>
          <CardDescription>
            Crop a specific portion of the image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cropX">X Offset (px)</Label>
              <Input
                id="cropX"
                type="number"
                value={cropX}
                onChange={(e) => setCropX(parseInt(e.target.value) || 0)}
                min="0"
                max={selectedImage.naturalWidth}
              />
            </div>
            <div>
              <Label htmlFor="cropY">Y Offset (px)</Label>
              <Input
                id="cropY"
                type="number"
                value={cropY}
                onChange={(e) => setCropY(parseInt(e.target.value) || 0)}
                min="0"
                max={selectedImage.naturalHeight}
              />
            </div>
            <div>
              <Label htmlFor="cropWidth">Width (px)</Label>
              <Input
                id="cropWidth"
                type="number"
                value={cropWidth}
                onChange={(e) => setCropWidth(parseInt(e.target.value) || 0)}
                min="1"
                max={selectedImage.naturalWidth}
              />
            </div>
            <div>
              <Label htmlFor="cropHeight">Height (px)</Label>
              <Input
                id="cropHeight"
                type="number"
                value={cropHeight}
                onChange={(e) => setCropHeight(parseInt(e.target.value) || 0)}
                min="1"
                max={selectedImage.naturalHeight}
              />
            </div>
          </div>
          <Button 
            onClick={() => processImage('crop')} 
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Crop Image'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Convert Format
          </CardTitle>
          <CardDescription>
            Convert the image to a different format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select
              id="format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </Select>
          </div>
          <Button 
            onClick={() => processImage('convert')} 
            disabled={processing}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Convert Format'}
          </Button>
        </CardContent>
      </Card>

      {processedCanvas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Processed Image
            </CardTitle>
            <CardDescription>
              Your processed image is ready for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted">
                <img 
                  src={processedCanvas.toDataURL(`image/${outputFormat}`, 0.9)}
                  alt="Processed image"
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <Button onClick={handleDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}