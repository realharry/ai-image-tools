export interface ImageInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface ResizeParams {
  width: number;
  height: number;
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ProcessImageParams {
  operation: 'resize' | 'crop' | 'convert';
  resizeParams?: ResizeParams;
  cropParams?: CropParams;
  format?: ImageFormat;
}