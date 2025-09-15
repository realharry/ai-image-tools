import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadImage(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}

export function resizeImage(
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

export function cropImage(
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  return canvas;
}

export function convertImageFormat(
  img: HTMLImageElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  ctx.drawImage(img, 0, 0);
  return canvas;
}