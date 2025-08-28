import multer from "multer";
import path from "path";
import fs from "fs";

// Create signatures subdirectory
const signatureUploadDir = path.join(process.cwd(), "uploads", "signatures");
if (!fs.existsSync(signatureUploadDir)) {
  fs.mkdirSync(signatureUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, signatureUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, "-")
      .toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `signature-${base}-${unique}${ext}`);
  },
});

const signatureUpload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export default signatureUpload;
