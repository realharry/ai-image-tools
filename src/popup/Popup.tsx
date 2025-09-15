import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PanelRightOpen, Zap } from 'lucide-react';

export function Popup() {
  const openSidePanel = async () => {
    try {
      // Just close the popup since the side panel should open automatically
      // when the extension is configured with openPanelOnActionClick: true
      window.close(); 
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-80 p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6" />
            AI Image Tools
          </CardTitle>
          <CardDescription>
            Manipulate images from any webpage with powerful editing tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Resize images to any dimensions</p>
            <p>• Crop specific portions</p>
            <p>• Convert between formats (PNG, JPEG, WebP)</p>
            <p>• Download processed images instantly</p>
          </div>
          
          <Button onClick={openSidePanel} className="w-full">
            <PanelRightOpen className="h-4 w-4 mr-2" />
            Open Side Panel
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Click the button above to open the image editing side panel
          </p>
        </CardContent>
      </Card>
    </div>
  );
}