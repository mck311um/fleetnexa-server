import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  tenantId: string;
}

function setupSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        user: UserPayload;
      };

      (socket as any).user = decoded.user;

      return next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;

    console.log("✅ Socket connected for user:", user);

    socket.join(user.tenantId);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected for user:", user.id);
    });
  });
}

export default setupSocket;
