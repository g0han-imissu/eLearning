const cloudinary = require("../../lib/cloudinary");
const ApiError = require("../../utils/apiError");

// Hàm helper: đẩy buffer (dữ liệu file trong RAM) lên Cloudinary
// Trả về Promise vì Cloudinary dùng callback, ta wrap lại cho gọn
const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(new ApiError(500, error.message));
      else resolve(result);
    });
    stream.end(buffer); // đẩy dữ liệu vào stream
  });

// POST /api/upload/video
const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");

    // req.file.buffer = dữ liệu video trong RAM (do multer memoryStorage)
    const result = await streamUpload(req.file.buffer, {
      resource_type: "video",   // nói với Cloudinary đây là video
      folder: "elearning/videos", // lưu vào thư mục này trên Cloudinary
      // Cloudinary tự đặt tên file bằng public_id ngẫu nhiên
    });

    // Trả về thông tin để frontend/backend lưu vào DB
    res.json({
      url: result.secure_url,          // URL https để phát video
      publicId: result.public_id,      // ID để xóa file sau này nếu cần
      durationSecond: Math.round(result.duration || 0),
      provider: "cloudinary",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/upload/document
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");

    const result = await streamUpload(req.file.buffer, {
      resource_type: "raw",          // "raw" = file không phải ảnh/video
      folder: "elearning/documents",
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      provider: "cloudinary",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/upload/image
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");

    const result = await streamUpload(req.file.buffer, {
      resource_type: "image",
      folder: "elearning/images",
      transformation: [
        { width: 800, crop: "limit" }, // tự động resize ảnh tối đa 800px
        { quality: "auto" },           // tự động nén chất lượng
      ],
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      provider: "cloudinary",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadVideo, uploadDocument, uploadImage };
