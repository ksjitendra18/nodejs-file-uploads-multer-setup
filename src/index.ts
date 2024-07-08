import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { multerMiddleware } from "./middlewares/multer";
import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";

const app = express();
dotenv.config();
app.use(cors());
app.use(json());

app.post("/upload", multerMiddleware.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: { code: "no_file", message: "No file uploaded" },
      });
    }

    const fileName = file.filename;
    const fileSize = file.size;
    const mimetype = file.mimetype;

    console.log("filename", fileName);
    console.log("fileSize", fileSize);
    console.log("mimetype", mimetype);

    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      fs.unlink(file.path, (err) => {
        console.error("error while deleting file", err);
      });
      return res.status(415).json({
        error: { code: "invalid_file", message: "Invalid File" },
      });
    }

    // 10MB
    if (fileSize > 10000000) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("error while deleting file", err);
        }
      });
      return res.status(413).json({
        error: { code: "file_size_limit", message: "File size limit exceeded" },
      });
    }

    // perform some operations on the file

    // delete file
    fs.unlink(file.path, (err) => {
      console.log("err", err);
      if (err) {
        console.error("error while deleting file", err);
      }
    });

    return res.json({
      data: {
        filePath: `/uploads/${file.filename}`,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: { code: "server_error", message: "Internal server error" },
    });
  }
});

app.post(
  "/upload-cloudinary",
  multerMiddleware.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: { code: "no_file", message: "No file uploaded" },
        });
      }
      const fileSize = file.size;
      const mimetype = file.mimetype;

      if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("error while deleting file", err);
          }
        });
        return res.status(415).json({
          error: { code: "invalid_file", message: "Invalid File" },
        });
      }

      // 5MB
      if (fileSize > 5000000) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("error while deleting file", err);
          }
        });
        return res.status(413).json({
          error: {
            code: "file_size_limit",
            message: "File size limit exceeded",
          },
        });
      }

      const cloudinaryResponse = await cloudinary.uploader.upload(
        file.path,
        {},
        (err) => {
          if (err) {
            console.error("error while uploading file", err);
          }
        }
      );

      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("error while deleting file", err);
        }
      });

      return res.json({
        data: {
          url: cloudinaryResponse.secure_url,
        },
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: { code: "server_error", message: "Internal server error" },
      });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("App running on ", PORT);
});
