import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Xác thực JWT khi connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      socket.user = jwt.verify(token, jwtSecret);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Vào phòng học (sessionId là channel)
    socket.on("join-room", (sessionId) => {
      socket.join(sessionId);
    });

    // Giảng viên phát quiz → broadcast cho cả phòng
    socket.on("quiz:launch", ({ sessionId, quiz }) => {
      socket.to(sessionId).emit("quiz:launched", quiz);
    });

    // Học viên nộp quiz → gửi về cho giảng viên
    socket.on("quiz:submit", ({ sessionId, result }) => {
      socket.to(sessionId).emit("quiz:result", {
        userId: socket.user.userId,
        ...result,
      });
    });

    // Giảng viên kết thúc quiz
    socket.on("quiz:end", ({ sessionId }) => {
      socket.to(sessionId).emit("quiz:ended");
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => io;
