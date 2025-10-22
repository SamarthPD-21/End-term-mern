import multer from "multer";

// Use memory storage so we can directly upload the buffer to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed!"), false);
  } else {
    cb(null, true);
  }
};

// Allow configuring max file size via env (in MB). Default to 10MB.
const maxMb = parseInt(process.env.UPLOAD_MAX_FILE_MB || "10", 10);
const limits = { fileSize: maxMb * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

export default upload;
