/**
 * Domain types for Processors, Progress Tracking, and Options.
 */

export type PageSize = 'A4' | 'Letter' | 'FitImage';
export type PageOrientation = 'auto' | 'portrait' | 'landscape';
export type ImageFit = 'contain' | 'cover' | 'fill';
export type MarginOption = 'none' | 'small' | 'medium' | 'large';

export interface ImageToPdfOptions {
  pageSize: PageSize;
  orientation: PageOrientation;
  margin: MarginOption;
  fit: ImageFit;
  quality: number; // 0.1 to 1.0
  backgroundColor?: string;
}

export interface TextToPdfOptions {
  fontSize: number;
  lineHeight: number;
  pageSize: 'A4' | 'Letter';
  margin: MarginOption;
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
  includePageNumbers: boolean;
}

export interface PdfToImageOptions {
  format: 'image/jpeg' | 'image/png';
  quality: number; // 0.1 to 1.0
  scale: number; // default: 2.0 for crisp retina rendering
  selectedPages: number[]; // 1-indexed page numbers
}

export interface ProcessingProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  statusMessage: string;
}

export type ProcessingState = 
  | 'idle'
  | 'processing'
  | 'success'
  | 'error';

export interface OcrResult {
  text: string;
  confidence: number;
}
