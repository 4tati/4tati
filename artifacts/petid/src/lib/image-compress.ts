/**
 * Client-side image compression before upload.
 *
 * Pet photos were being uploaded (and later downloaded) at full camera
 * resolution, which made the profile page feel slow to load, especially on
 * mobile connections. This resizes/re-encodes large images in the browser
 * before they ever reach the server, so both the upload and every future
 * page load are faster.
 *
 * Strategy: cap the longest edge at MAX_DIMENSION, and beyond that shrink by
 * an extra ~30% if the file is still large after the initial resize. Always
 * re-encode as JPEG at a reasonable quality, which alone typically cuts
 * photo size by 60-80% with no visible difference on a phone screen.
 */

const MAX_DIMENSION = 1600;
const EXTRA_SHRINK_THRESHOLD_BYTES = 1.5 * 1024 * 1024; // 1.5MB
const EXTRA_SHRINK_FACTOR = 0.7; // reduce resolution by 30%
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // Skip non-raster formats (e.g. SVG) - nothing to gain from re-encoding.
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  try {
    const bitmap = await loadBitmap(file);

    let { width, height } = bitmap;
    const longestEdge = Math.max(width, height);

    let scale = longestEdge > MAX_DIMENSION ? MAX_DIMENSION / longestEdge : 1;

    // If the original file is large, shrink further so it opens quickly
    // even on slow connections.
    if (file.size > EXTRA_SHRINK_THRESHOLD_BYTES) {
      scale *= EXTRA_SHRINK_FACTOR;
    }

    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );

    if (!blob || blob.size >= file.size) {
      // Compression didn't help (e.g. already a small/optimized image) -
      // keep the original rather than risk a worse result.
      return file;
    }

    const newName = file.name.replace(/\.[^./]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.error('Image compression failed, uploading original file', err);
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  // Fallback for environments without createImageBitmap support.
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
