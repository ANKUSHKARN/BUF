import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload multiple files to Cloudinary
 */
export const uploadFilesToCloudinary = async (
  files: Express.Multer.File[],
  folder: string
) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  if (files.length > 5) {
    throw new Error("Maximum 5 files allowed");
  }

  const uploadSingle = (file: Express.Multer.File) =>
    new Promise<{ fileUrl: string; filePublicId: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              return reject(error);
            }

            resolve({
              fileUrl: result.secure_url,
              filePublicId: result.public_id,
            });
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      }
    );

  const uploaded = await Promise.all(
    files.map((file) => uploadSingle(file))
  );

  return uploaded;
};

/**
 * Delete file from Cloudinary
 */
export const deleteFileFromCloudinary = async (
  publicId: string
) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};