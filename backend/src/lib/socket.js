import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";
import { prismaAdmin } from "./prisma.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Xác thực JWT + load user từ DB (kiểm tra trạng thái user và organization)
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = jwt.verify(token, jwtSecret);
      const user = await prismaAdmin.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true, fullName: true, status: true, organizationId: true,
          organization: { select: { status: true } },
        },
      });
      if (!user || user.status !== "ACTIVE") return next(new Error("Unauthorized"));
      if (user.organization && user.organization.status !== "ACTIVE") {
        return next(new Error("Organization suspended"));
      }
      socket.user = { userId: user.id, fullName: user.fullName, organizationId: user.organizationId };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ sessionId, name }) => {
      // Session phải thuộc organization của user — chặn join chéo tenant
      const session = await prismaAdmin.liveSession.findFirst({
        where: { id: sessionId, class: { organizationId: socket.user.organizationId } },
        select: { id: true },
      });
      if (!session) {
        socket.emit("room:error", { message: "Session not found" });
        return;
      }

      // Room name do server tính, prefix theo org — client không kiểm soát được
      const room = `org:${socket.user.organizationId}:session:${sessionId}`;
      socket.join(room);
      socket.data.room = room;
      socket.data.name = name || `User ${socket.user.userId}`;
      io.to(room).emit("room:joined", {
        userId: socket.user.userId,
        name: socket.data.name,
      });
    });

    // Các event quiz chỉ phát trong room đã join — bỏ qua sessionId từ client
    socket.on("quiz:launch", ({ quiz }) => {
      if (socket.data.room) socket.to(socket.data.room).emit("quiz:launched", quiz);
    });

    socket.on("quiz:submit", ({ result }) => {
      if (socket.data.room) {
        socket.to(socket.data.room).emit("quiz:result", {
          userId: socket.user.userId,
          name: socket.data.name,
          ...result,
        });
      }
    });

    socket.on("quiz:end", () => {
      if (socket.data.room) socket.to(socket.data.room).emit("quiz:ended");
    });

    socket.on("disconnect", () => {
      const room = socket.data?.room;
      if (room) {
        socket.to(room).emit("room:left", { userId: socket.user.userId });
      }
    });
  });

  return io;
};

export const getIO = () => io;
