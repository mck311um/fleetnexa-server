import app from "./app";
import logUtil from "./config/logger.config";
import { Server } from "socket.io";
import http from "http";
import setupSocket from "./config/socket";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://app.fleetnexa.com", "http://localhost:5173"],
    credentials: true,
  },
});

app.set("io", io);
setupSocket(io);

server.listen(PORT, () => {
  logUtil.logger.info(`Server running on port ${PORT}`);
});
