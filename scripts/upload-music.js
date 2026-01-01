const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure manually since we are running standalone node script
// We need to read .env or just use the values from context if known?
// I will try to read from process.env if loaded, but node script won't load .env auto.
// I'll assume the user has the keys in .env and I can read them or requires dotenv.

require('dotenv').config({ path: '.env' });

const MUSIC_DIR = path.join(__dirname, '../public/music');

async function uploadMusic() {
    const files = fs.readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mp3'));

    for (const file of files) {
        const filePath = path.join(MUSIC_DIR, file);
        console.log(`Uploading ${file}...`);
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: 'video', // 'video' resource type is used for audio in Cloudinary usually or 'auto'
                folder: 'dream_music',
                public_id: file.replace('.mp3', ''),
                overwrite: true
            });
            console.log(`Uploaded ${file}: ${result.secure_url}`);
        } catch (e) {
            console.error(`Failed ${file}`, e);
        }
    }
}

uploadMusic();
