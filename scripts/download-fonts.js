const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const fonts = {
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700',
    'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue',
    'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@700',
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@700'
};

const fontFiles = {
    'Montserrat': 'Montserrat-Bold.ttf',
    'Playfair Display': 'PlayfairDisplay-Bold.ttf',
    'Bebas Neue': 'BebasNeue-Regular.ttf',
    'Outfit': 'Outfit-Bold.ttf',
    'Inter': 'Inter-Bold.ttf'
};

async function downloadFonts() {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

    for (const [name, url] of Object.entries(fonts)) {
        console.log(`🔍 Processing ${name}...`);
        try {
            // Using a specific UA that forces TTF from Google Fonts
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0'
                }
            });
            const css = await response.text();

            // Look for the latin subset URL
            const latinMatch = css.match(/\/\* latin \*\/[\s\S]+?src: url\((https:\/\/[^)]+)\)/);
            let fontUrl = latinMatch ? latinMatch[1] : null;

            if (!fontUrl) {
                const anyMatch = css.match(/src: url\((https:\/\/[^)]+)\)/);
                fontUrl = anyMatch ? anyMatch[1] : null;
            }

            if (fontUrl) {
                console.log(`📥 Downloading ${name} from ${fontUrl}`);
                const fontRes = await fetch(fontUrl);
                const buffer = await fontRes.buffer();
                const dest = path.join(fontsDir, fontFiles[name]);
                fs.writeFileSync(dest, buffer);
                console.log(`✅ Saved to ${dest} (${(buffer.length / 1024).toFixed(2)} KB)`);

                // Final verify of magic bytes
                const magic = buffer.slice(0, 4).toString('hex');
                console.log(`✨ Magic bytes: ${magic}`);
            } else {
                console.error(`❌ Could not find font URL for ${name}`);
            }
        } catch (err) {
            console.error(`❌ Failed ${name}:`, err);
        }
    }
}

downloadFonts();
