import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, fileName) => {
    try {
        if(!filePath) throw new Error("File path is required");
        const response = await cloudinary.uploader.upload(filePath, {
            folder: "user_pfp",
            public_id: fileName,
            resource_type: "auto",
        })
        console.log("File uploaded successfully ", response.url);
        fs.unlinkSync(filePath); // remove the locally saved temporary file after successful upload
        return response;
    } catch (error) {
        fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload failed
        return null;
    }
}

export default uploadToCloudinary;