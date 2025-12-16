export enum AppStatus {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  original: string; // base64
  sketch: string;   // base64
}

export type InputMode = 'camera' | 'upload';
export type SketchStyle = 'bw' | 'color';