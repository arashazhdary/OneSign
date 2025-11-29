const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/onesign-logo.png');
const outputDir = path.join(__dirname, '../public');

// Icon sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon.ico', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating icons from:', inputPath);

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);

    try {
      if (name.endsWith('.ico')) {
        // For ICO files, use PNG format (browsers handle this)
        await sharp(inputPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath.replace('.ico', '-48x48.png'));
        console.log(`✓ Generated ${name.replace('.ico', '-48x48.png')}`);
      } else {
        await sharp(inputPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        console.log(`✓ Generated ${name}`);
      }
    } catch (error) {
      console.error(`✗ Error generating ${name}:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
