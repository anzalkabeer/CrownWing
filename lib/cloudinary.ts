import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // We log a warning but don't throw, so the app can still start if Cloudinary is only for specific features.
  console.warn('Cloudinary environment variables are missing. Image uploads will fail.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
export default cloudinary;

/**
 * Uploads a raw PDF buffer to Cloudinary.
 * @param buffer - The PDF binary buffer.
 * @param filename - Desired filename (e.g., 'receipt.pdf').
 * @returns The secure URL of the uploaded PDF.
 */
export async function uploadPDF(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const sanitizedName = filename
      .replace(/\.[^/.]+$/i, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/[._-]{2,}/g, '_')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 120) || 'document';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: `crownwing/docs/${Date.now()}_${sanitizedName}`,
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary returned no result.'));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
