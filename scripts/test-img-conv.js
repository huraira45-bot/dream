const fetch = require('node-fetch');

async function testImageFetch() {
    const imgUrl = "https://pollinations.ai/p/Branded%20lifestyle%20illustration%2C%20Modern%20theme%2C%203D%20Character%20Illustration%20(stylized%2C%20friendly)%2C%20Stylized%20Animal%20Illustration%20(rendered%2C%20near-photorealistic)%2C%20Photorealistic%20(for%20architectural%20elements)%2C%203D%20render%2C%20Pixar%20style%2C%20studio%20lighting%2C%20vibrant%2C%201080x1080?width=1080&height=1080&model=flux&seed=830065&nologo=true&enhance=true";

    console.log("🚀 Starting image fetch...");
    try {
        const start = Date.now();
        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) throw new Error("Fetch failed");

        console.log(`✅ Fetch complete in ${Date.now() - start}ms`);
        const arrayBuffer = await imgRes.arrayBuffer();
        console.log(`📏 Image size: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);

        const convStart = Date.now();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = '';
        // Testing the slow loop
        for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        const base64String = Buffer.from(binary, 'binary').toString('base64');
        console.log(`✨ Conversion (Slow Loop) complete in ${Date.now() - convStart}ms`);

        const buffStart = Date.now();
        const fastBase64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`⚡ Conversion (Buffer) complete in ${Date.now() - buffStart}ms`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
}

testImageFetch();
