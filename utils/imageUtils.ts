const THUMBNAIL_WIDTH = 128;
const THUMBNAIL_HEIGHT = 128;

/**
 * Creates a small, fixed-size thumbnail from a base64 image string.
 * This is used to optimize memory usage in the history panel.
 * @param base64Image The full-resolution base64 image string.
 * @returns A promise that resolves to a smaller, thumbnail-sized base64 image string.
 */
export const createThumbnail = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not create canvas context'));
      }

      // Draw the image onto the canvas, cropping to center if aspect ratios differ
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio
      );

      // Get the thumbnail as a base64 string
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = base64Image;
  });
};
