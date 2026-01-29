/**
 * Photoshop Generator API type definitions
 */

export interface Generator {
  onPhotoshopEvent(event: string, handler: (...args: any[]) => void | Promise<void>): void;
  addMenuItem(id: string, label: string, enabled: boolean, checked: boolean): void;
  removeMenuItem(id: string): void;
  evaluateJSXFile(filePath: string): Promise<any>;
  evaluateJSXString(script: string): Promise<any>;
  getDocumentInfo(documentId?: number): Promise<DocumentInfo>;
  getLayerInfo(documentId: number, layerId: number): Promise<LayerInfo>;
  alert(message: string): Promise<void>;
}

export interface DocumentInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  resolution: number;
  colorMode: string;
  bitDepth: number;
  hasBackgroundLayer: boolean;
  layers: LayerInfo[];
}

export interface LayerInfo {
  id: number;
  name: string;
  type: string;
  visible: boolean;
  opacity: number;
  bounds: Bounds;
  parent?: number;
}

export interface Bounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface PixmapSettings {
  inputRect?: Bounds;
  outputRect?: Bounds;
  scaleX?: number;
  scaleY?: number;
  interpolationType?: 'nearestNeighbor' | 'bilinear' | 'bicubic' | 'bicubicSmoother' | 'bicubicSharper';
  format?: 'png' | 'jpg' | 'pixmap';
  quality?: number;
  ppi?: number;
}
