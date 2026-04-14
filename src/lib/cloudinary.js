import { v2 as cloudinary } from "cloudinary";
import { cloudinary as config } from "../config/env.js";

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
});

export default cloudinary;
