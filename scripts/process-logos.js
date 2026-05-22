import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, '..', 'public', 'images', 'alianzas');
const outputDir = inputDir;

const logos = [
  { input: 'aws-original.png', output: 'aws.webp', resize: { width: 200 }, trim: false },
  { input: 'arpel-original.png', output: 'arpel.webp', resize: { width: 200 }, trim: true },
  { input: 'enginzone-original.png', output: 'enginzone.webp', resize: { width: 200 }, trim: true },
  { input: 'icc-original.svg', output: 'icc.webp', resize: { width: 200 }, trim: false },
  { input: 'spe-original.png', output: 'spe.webp', resize: { width: 200 }, trim: false },
  { input: 'aapg-original.png', output: 'aapg.webp', resize: { width: 200 }, trim: false },
];

for (const logo of logos) {
  const inputPath = path.join(inputDir, logo.input);
  const outputPath = path.join(outputDir, logo.output);

  console.log(`Processing ${logo.input} -> ${logo.output}...`);

  let pipeline = sharp(inputPath);

  // Resize manteniendo aspect ratio
  if (logo.resize) {
    pipeline = pipeline.resize(logo.resize.width, null, { fit: 'inside' });
  }

  // Trim para quitar fondos blancos (solo si es necesario y funciona)
  // Nota: .trim() puede fallar en PNGs con compresión, por eso es opcional
  if (logo.trim) {
    try {
      pipeline = pipeline.trim();
    } catch (e) {
      console.log(`  Warning: trim failed for ${logo.input}, skipping trim`);
    }
  }

  await pipeline
    .webp({ quality: 90 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  console.log(`  Done: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);
}

console.log('\nAll logos processed!');
