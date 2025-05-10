// server.js or index.js

import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "https://linkedin1-frontend.onrender.com", // frontend port
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Make sure this matches your frontend
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);

// Socket map for tracking users
export const userSocketMap = new Map();

// Socket.io handling
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Handle registration of user with socket
  socket.on("register", (userId) => {
    if (userId) {
      socket.userId = userId; // Attach userId to socket
      userSocketMap.set(userId, socket.id);
      console.log("User registered:", userId, "| Socket:", socket.id);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
      console.log("User disconnected:", socket.userId);
    } else {
      console.log("User disconnected (unregistered socket):", socket.id);
    }
  });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  connectDb();
  console.log(`Server started on port ${port}`);
});
