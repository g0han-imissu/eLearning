import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const nodeEnv = process.env.NODE_ENV || "development";
export const port = Number(process.env.PORT || 4000);
export const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
export const refreshTokenExpiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30);
export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
export const emailPort = Number(process.env.EMAIL_PORT || 587);
export const emailUser = process.env.EMAIL_USER || "";
export const emailPass = process.env.EMAIL_PASS || "";
