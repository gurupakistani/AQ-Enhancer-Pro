export enum EditEffectType {
  UPSCALE = 'UPSCALE',
  ENHANCE = 'ENHANCE',
  ENHANCE_FACE = 'ENHANCE_FACE',
  VINTAGE = 'VINTAGE',
  CINEMATIC = 'CINEMATIC',
  HIGH_QUALITY = 'HIGH_QUALITY',
  BLACK_AND_WHITE = 'BLACK_AND_WHITE',
  POP_ART = 'POP_ART',
  NEON_PUNK = 'NEON_PUNK',
  WATERCOLOR = 'WATERCOLOR',
  REMOVE_BG = 'REMOVE_BG',
  DRAWING = 'DRAWING',
  OIL_PAINTING = 'OIL_PAINTING',
  ASPECT_1_1 = 'ASPECT_1_1',
  ASPECT_4_5 = 'ASPECT_4_5',
  ASPECT_9_16 = 'ASPECT_9_16',
  ASPECT_16_9 = 'ASPECT_16_9',
  ASPECT_4_3 = 'ASPECT_4_3',
}

export interface EditEffect {
  type: EditEffectType;
  label: string;
  prompt: string;
}

export type ChatEffect = 'CHAT';
export type CustomEditEffect = { type: 'CUSTOM', label: string };
export type HistoryEffect = EditEffectType | ChatEffect | CustomEditEffect | null;

export interface HistoryState {
  image: string; // Full-resolution base64
  thumbnail: string; // Low-resolution base64 for UI
  effectType: HistoryEffect;
}

export type BatchImageStatus = 'idle' | 'queued' | 'processing' | 'success' | 'error';

export interface BatchImage {
  id: string;
  originalURL: string;
  editedURL: string | null;
  mimeType: string;
  base64: string;
  status: BatchImageStatus;
  error: string | null;
}