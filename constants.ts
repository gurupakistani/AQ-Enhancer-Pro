import { EditEffect, EditEffectType } from './types';

export const EDIT_EFFECTS: EditEffect[] = [
  {
    type: EditEffectType.HIGH_QUALITY,
    label: 'Make High Quality',
    prompt: 'Analyze this image and significantly enhance its overall quality. Improve resolution, sharpness, color balance, and lighting to make it look like it was taken with a professional high-end camera. Remove any noise or artifacts.'
  },
  {
    type: EditEffectType.UPSCALE,
    label: 'Upscale 2x',
    prompt: 'Upscale this image to twice its original resolution. Increase details and sharpness while ensuring the result looks natural and free of artifacts.'
  },
  {
    type: EditEffectType.ENHANCE,
    label: 'Auto Enhance',
    prompt: 'Automatically enhance this image. Adjust brightness, contrast, saturation, and sharpness to make the photo more vibrant and visually appealing. Correct any color cast issues.'
  },
  {
    type: EditEffectType.ENHANCE_FACE,
    label: 'Enhance Face',
    prompt: 'Enhance the human faces in this photo. Subtly improve skin texture, brighten eyes, and enhance facial details for a clear and flattering portrait, while keeping a completely natural look.'
  },
  {
    type: EditEffectType.CINEMATIC,
    label: 'Cinematic Look',
    prompt: 'Apply a cinematic color grade to this image. Add teal and orange tones, increase contrast slightly, and add a subtle vignette to give it a dramatic, movie-like feel.'
  },
  {
    type: EditEffectType.VINTAGE,
    label: 'Vintage Effect',
    prompt: 'Give this image a vintage, retro look. Apply a faded color palette, add a subtle grain, and slightly decrease contrast to simulate the appearance of an old photograph.'
  },
  {
    type: EditEffectType.BLACK_AND_WHITE,
    label: 'Black & White',
    prompt: 'Convert this image to a high-contrast, dramatic black and white photograph. Emphasize textures and shadows for a powerful monochrome look.'
  },
  {
    type: EditEffectType.POP_ART,
    label: 'Pop Art',
    prompt: 'Transform this image into a vibrant, colorful Pop Art style inspired by Andy Warhol. Use bold, saturated colors and strong outlines.'
  },
  {
    type: EditEffectType.NEON_PUNK,
    label: 'Neon Punk',
    prompt: 'Give this image a futuristic, neon-punk aesthetic. Add glowing neon highlights, cool blue and magenta tones, and a gritty, high-tech feel.'
  },
  {
    type: EditEffectType.WATERCOLOR,
    label: 'Watercolor',
    prompt: 'Convert this image into a soft and delicate watercolor painting. Blend colors smoothly and create a painterly texture with visible brush strokes.'
  },
  {
    type: EditEffectType.DRAWING,
    label: 'Pencil Drawing',
    prompt: 'Convert this image into a detailed monochrome pencil sketch. Emphasize lines, shading, and texture to create a realistic hand-drawn look.'
  },
  {
    type: EditEffectType.OIL_PAINTING,
    label: 'Oil Painting',
    prompt: 'Transform this image into a classic oil painting. Use rich colors, visible impasto brushstrokes, and a textured canvas effect.'
  },
  {
    type: EditEffectType.REMOVE_BG,
    label: 'Remove BG',
    prompt: 'Identify the main subject in this image and completely remove the background, replacing it with a transparent one. The edges of the subject should be clean and precise.'
  },
];

export const ASPECT_RATIO_EFFECTS: EditEffect[] = [
  {
    type: EditEffectType.ASPECT_1_1,
    label: 'Square (1:1)',
    prompt: 'Change the aspect ratio of this image to 1:1 (a perfect square). Do not crop the main subject. Intelligently fill any new space to preserve the original content.',
  },
  {
    type: EditEffectType.ASPECT_4_5,
    label: 'Portrait (4:5)',
    prompt: 'Change the aspect ratio of this image to 4:5 (a vertical portrait). Do not crop the main subject. Intelligently fill any new space to preserve the original content.',
  },
  {
    type: EditEffectType.ASPECT_9_16,
    label: 'Story (9:16)',
    prompt: 'Change the aspect ratio of this image to 9:16 (a vertical story format). Do not crop the main subject. Intelligently fill any new space to preserve the original content.',
  },
  {
    type: EditEffectType.ASPECT_16_9,
    label: 'Widescreen (16:9)',
    prompt: 'Change the aspect ratio of this image to 16:9 (a widescreen format). Do not crop the main subject. Intelligently fill any new space to preserve the original content.',
  },
  {
    type: EditEffectType.ASPECT_4_3,
    label: 'Classic (4:3)',
    prompt: 'Change the aspect ratio of this image to 4:3 (a classic photo format). Do not crop the main subject. Intelligently fill any new space to preserve the original content.',
  },
];