import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { nodeEnv } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// CSP tắt vì app cần kết nối Agora/Cloudinary từ trình duyệt
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan(nodeEnv === "production" ? "combined" : "dev"));

// File tải lên (chế độ lưu cục bộ khi chưa cấu hình Cloudinary)
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

// Production: backend phục vụ luôn frontend build (SPA fallback cho client-side routing)
if (nodeEnv === "production") {
  const distDir = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/socket.io")) return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(errorMiddleware);

export default app;
