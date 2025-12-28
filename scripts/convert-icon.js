const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const icoPath = path.join(__dirname, '../public/favicon.ico');
const pngPath = path.join(__dirname, '../public/icon.png'); // Also generate PNG for Apple Touch Icon

async function convert() {
    try {
        console.log('Converting public/favicon.svg...');

        // Generate PNG first
        await sharp(svgPath)
            .resize(32, 32)
            .toFormat('png')
            .toFile(icoPath.replace('.ico', '.png')); // Temp png for ico

        // Create standard 32x32 PNG as icon.png
        await sharp(svgPath)
            .resize(192, 192)
            .toFile(pngPath);

        console.log('✅ Generated public/icon.png (192x192)');

        // For ICO, we rename the 32x32 png or use simple copy if user environment allows
        // Ideally use a dedicated lib, but for now let's just create a PNG named .ico (works in modern browsers)
        // or keep the SVG and just add fallback.
        // Better approach: Let's rely on standard Next.js conventions.
        // Next.js automatically handles /favicon.ico if present.

        // Simulating ICO by just ensuring there's a fallback PNG
        console.log('NOTE: Creating icon.png for reliable fallback.');

    } catch (err) {
        console.error('Error converting:', err);
    }
}

convert();
