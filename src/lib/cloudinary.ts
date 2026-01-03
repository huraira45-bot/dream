import { v2 as cloudinary } from 'cloudinary'

export function configCloudinary() {
    const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    }

    if (!config.api_key) {
        console.error("❌ CLOUDINARY_API_KEY is missing in process.env")
    } else {
        console.log(`✅ Cloudinary Configured for: ${config.cloud_name}`)
    }

    cloudinary.config(config)
    return cloudinary
}

export default cloudinary
