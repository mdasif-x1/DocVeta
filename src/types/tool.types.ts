/**
 * Domain types for the Central Tool Registry & Information Architecture.
 */

export type ToolCategory = 'convert' | 'organize' | 'create';

export type ToolId = 
  | 'image-to-pdf'
  | 'jpg-to-pdf'
  | 'png-to-pdf'
  | 'webp-to-pdf'
  | 'text-to-pdf'
  | 'merge-pdf'
  | 'pdf-to-image'
  | 'pdf-to-text'
  | 'image-to-text';

export interface ToolMetadata {
  id: ToolId;
  name: string;
  shortName: string;
  slug: string;
  category: ToolCategory;
  description: string;
  popular?: boolean;
  acceptedMimes: string[];
  acceptedExtensions: string[];
  multipleFiles: boolean;
  allowCamera?: boolean;
  relatedToolSlugs: string[];
  iconName: string;
  limits: {
    maxFiles: number;
    maxSingleSize: number;
    maxBatchSize: number;
  };
}
