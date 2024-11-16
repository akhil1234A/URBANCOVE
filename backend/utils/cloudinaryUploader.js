const cloudinary = require('../config/cloudinaryConfig');

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder, 
      resource_type: 'image', 
    });
    return result.secure_url; 
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

module.exports = uploadToCloudinary;
