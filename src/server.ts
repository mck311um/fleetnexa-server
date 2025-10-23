import app from './app';
import { Server } from 'socket.io';
import http from 'http';
import setupSocket from './config/socket';
import { logger } from './config/logger';

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://app.fleetnexa.com',
      'https://dev.app.fleetnexa.com',
      'http://localhost:5173',
    ],
    credentials: true,
  },
});

app.set('io', io);
setupSocket(io);

server.listen(PORT, () => {
  logger.i(`Server running on port ${PORT}`);
});
