import multer from "multer";
import { customAlphabet } from "nanoid";
import path from "node:path";

const customId = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

const storage = multer.diskStorage({
  destination: "uploads/",

  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${customId()}${fileExtension}`;
    cb(null, fileName);
  },
});

export const multerMiddleware = multer({
  storage,
});
