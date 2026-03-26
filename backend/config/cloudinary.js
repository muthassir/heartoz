const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBase64 = async (dataUri, options = {}) => {
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: "auto", // handles image + video
    folder: "heartoz",
    ...options,
  });
  return result.secure_url; // just store this URL in MongoDB
};

const deleteByUrl = async (url) => {
  // Extract public_id from URL
  const parts = url.split("/");
  const file  = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${file}`;
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
};

module.exports = { uploadBase64, deleteByUrl };