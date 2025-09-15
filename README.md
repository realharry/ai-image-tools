# AI Image Tools

AI Image Tools is a Chrome extension that allows users to manipulate images from the currently active tab. Users can resize, crop, and convert images to different formats from the extension's side panel window. The processed images can be downloaded directly from the side panel.

## Features

- 🖼️ **Image Detection**: Automatically finds images on the current webpage
- 📏 **Resize**: Resize images to specific width and height dimensions
- ✂️ **Crop**: Crop specific portions of images with x/y offset and width/height controls  
- 🔄 **Format Conversion**: Convert between PNG, JPEG, and WebP formats
- 💾 **Download**: Download processed images directly to your device
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and Shadcn/ui components

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Extension**: Chrome Manifest v3 with side panel support
- **Image Processing**: HTML5 Canvas API

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-image-tools
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`  
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Development Scripts

- `npm run dev` - Start development server (for component development)
- `npm run build` - Build the extension for production
- `npm run lint` - Run ESLint

## Usage

1. Install the extension in Chrome
2. Navigate to any webpage with images
3. Click the extension icon to open the popup
4. Click "Open Side Panel" or use the side panel directly
5. The extension will scan for images on the current page
6. Select an image from the list
7. Choose your operation:
   - **Resize**: Enter new width and height
   - **Crop**: Enter x/y offsets and crop dimensions  
   - **Convert**: Select output format (PNG/JPEG/WebP)
8. Click the corresponding button to process
9. Download the processed image when ready

## Architecture

```
src/
├── background/          # Chrome extension background script
├── content/            # Content script for image detection
├── popup/              # Extension popup interface
├── sidepanel/          # Main side panel interface
├── components/
│   ├── ui/            # Reusable UI components (Shadcn style)
│   └── image/         # Image-specific components
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

## Extension Permissions

- `activeTab` - Access the current active tab
- `sidePanel` - Use Chrome's side panel API
- `storage` - Store user preferences (future use)
- `*://*/*` - Access images from any website

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
