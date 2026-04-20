import sharp from 'sharp';

const MIN_DIM = 800;
const MAX_DIM = 1500;

/**
 * Processes an image buffer to fit within 800×800 – 1500×1500.
 * If the image already fits within those bounds it is returned as-is
 * (converted to webp for consistency but not resized).
 */
export async function processImageBuffer(input: Buffer): Promise<Buffer> {
  const image = sharp(input);
  const { width, height } = await image.metadata();

  if (!width || !height) throw new Error('Could not read image metadata');

  const withinBounds =
    width >= MIN_DIM &&
    height >= MIN_DIM &&
    width <= MAX_DIM &&
    height <= MAX_DIM;

  if (withinBounds) {
    // Already in range — only convert to webp, no resize
    return image.webp({ quality: 90 }).toBuffer();
  }

  // Shrink if too large (fit inside 1500×1500), enlarge if too small (fit outside 800×800)
  const needsShrink = width > MAX_DIM || height > MAX_DIM;
  const needsGrow = width < MIN_DIM || height < MIN_DIM;

  let processed: Buffer;

  if (needsShrink) {
    processed = await image
      .resize({
        width: MAX_DIM,
        height: MAX_DIM,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();
  } else if (needsGrow) {
    // Scale up so the shorter side reaches MIN_DIM
    const scale = Math.max(MIN_DIM / width, MIN_DIM / height);
    processed = await image
      .resize(Math.round(width * scale), Math.round(height * scale))
      .webp({ quality: 90 })
      .toBuffer();
  } else {
    processed = await image.webp({ quality: 90 }).toBuffer();
  }

  return processed;
}
