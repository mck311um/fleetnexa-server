import app from "./app";
import logUtil from "./config/logger.config";
import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import setupSocket from "./config/socket";

const PORT = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === "production";

let server: http.Server | https.Server;

if (IS_PROD) {
  const credentials = {
    key: fs.readFileSync(
      path.resolve("/etc/letsencrypt/live/api.fleetnexa.com/privkey.pem")
    ),
    cert: fs.readFileSync(
      path.resolve("/etc/letsencrypt/live/api.fleetnexa.com/fullchain.pem")
    ),
  };

  server = https.createServer(credentials, app);
  logUtil.logger.info("✅ Using HTTPS server (production)");
} else {
  server = http.createServer(app);
  logUtil.logger.info("🛠 Using HTTP server (development)");
}

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.set("io", io);
setupSocket(io);

server.listen(PORT, () => {
  logUtil.logger.info(`🚀 Server running on port ${PORT}`);
});
