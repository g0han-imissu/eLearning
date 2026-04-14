import cloudinary from "../../lib/cloudinary.js";
import ApiError from "../../utils/apiError.js";

const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(new ApiError(500, error.message));
      else resolve(result);
    });
    stream.end(buffer);
  });

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    const result = await streamUpload(req.file.buffer, {
      resource_type: "video",
      folder: "elearning/videos",
    });
    res.json({ url: result.secure_url, publicId: result.public_id, durationSecond: Math.round(result.duration || 0), provider: "cloudinary" });
  } catch (e) { next(e); }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    const result = await streamUpload(req.file.buffer, { resource_type: "raw", folder: "elearning/documents" });
    res.json({ url: result.secure_url, publicId: result.public_id, fileType: req.file.mimetype, fileSize: req.file.size, provider: "cloudinary" });
  } catch (e) { next(e); }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    const result = await streamUpload(req.file.buffer, {
      resource_type: "image",
      folder: "elearning/images",
      transformation: [{ width: 800, crop: "limit" }, { quality: "auto" }],
    });
    res.json({ url: result.secure_url, publicId: result.public_id, provider: "cloudinary" });
  } catch (e) { next(e); }
};
