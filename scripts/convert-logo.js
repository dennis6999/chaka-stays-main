import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const svgPath = join(__dirname, '../public/logo.svg');
const pngPath = join(__dirname, '../public/logo.png');

exec(`svgexport ${svgPath} ${pngPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error converting SVG to PNG: ${error}`);
    return;
  }
  console.log('SVG converted to PNG successfully');
  
  // Now run the icon generation script
  import('./generate-icons.js');
}); 