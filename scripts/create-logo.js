import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple logo
const width = 512;
const height = 512;
const centerX = width / 2;
const centerY = height / 2;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <circle cx="${centerX}" cy="${centerY}" r="240" fill="#4F46E5"/>
  <path d="M256 120L120 240V392H392V240L256 120Z" fill="white"/>
  <path d="M200 392V280H312V392" stroke="white" stroke-width="24" fill="none"/>
  <text x="${centerX}" y="450" font-family="Arial" font-size="48" fill="white" text-anchor="middle">Chaka Stays</text>
</svg>`;

// Convert SVG to PNG
sharp(Buffer.from(svg))
  .png()
  .toFile(join(__dirname, '../public/logo.png'))
  .then(() => {
    console.log('Logo created successfully');
    // Now run the icon generation script
    import('./generate-icons.js');
  })
  .catch(err => {
    console.error('Error creating logo:', err);
  }); 