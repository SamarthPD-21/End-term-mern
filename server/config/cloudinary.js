import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Prefer a single CLOUDINARY_URL env var (format: cloudinary://<api_key>:<api_secret>@<cloud_name>)
// Fallback to the separate CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vars.
const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (CLOUDINARY_URL) {
  // cloudinary accepts a config object with cloudinary_url
  cloudinary.v2.config({ cloudinary_url: CLOUDINARY_URL });
    console.log("Cloudinary configured using CLOUDINARY_URL.");
} else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured using separate env vars.");
} else {
  console.warn(
    "Cloudinary env vars are missing. Set CLOUDINARY_URL (preferred) or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET in your .env"
  );
}

export default cloudinary.v2;
