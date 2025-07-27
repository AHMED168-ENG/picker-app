const multer = require("multer");
const path = require("path");
const fs = require("fs");

const defaultLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const ensureDirectoryExists = (dir) => {
  const absolutePath = path.join(process.cwd(), dir);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
  return absolutePath;
};

// إضافة function generateUniqueFileName
const generateUniqueFileName = (file) => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const extension = path.extname(file.originalname);
  return `voice_${timestamp}_${randomNum}${extension}`;
};

const audioFilter = (req, file, cb) => {
  const allowedMimetypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("الملف يجب أن يكون ملف صوتي (.mp3 أو .wav أو .ogg)"), false);
  }
};

const createStorage = (destinationPath) => {
  const absolutePath = ensureDirectoryExists(destinationPath);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, absolutePath);
    },
    filename: (req, file, cb) => {
      cb(null, generateUniqueFileName(file));
    },
  });
};

const uploadSingleAudio = (
  fieldName = "voiceNote",
  destinationPath = "Uploads/voice_notes",
  limits = defaultLimits
) => {
  const storage = createStorage(destinationPath);
  return multer({
    storage,
    fileFilter: audioFilter,
    limits,
  }).single(fieldName);
};

module.exports = {
  uploadSingleAudio,
};
