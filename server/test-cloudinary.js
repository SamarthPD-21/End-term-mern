import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js';

dotenv.config({ path: './.env' });

const run = async () => {
  try {
    console.log('Cloudinary config test - attempting upload');
    // Adjust the path to a small image file placed in the server folder
    const localPath = './sample-test-image.jpg';
    const result = await cloudinary.uploader.upload(localPath, { folder: 'test_upload' });
    console.log('Upload success:', result.secure_url);
  } catch (err) {
    console.error('Cloudinary test upload failed:', err && err.message ? err.message : err);
    console.error(err);
  }
};

run();
