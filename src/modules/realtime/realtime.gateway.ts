import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantNotification } from '../../generated/prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket) {
    const auth = this.extractAuth(client);

    if (!auth) {
      this.logger.warn(`Unauthenticated socket ${client.id}`);
      client.disconnect();
      return;
    }

    client.data.userId = auth.userId;
    client.data.tenantId = auth.tenantId;

    client.join(`tenant:${auth.tenantId}`);
    client.join(`user:${auth.userId}`);

    this.logger.log(
      `Socket connected ${client.id} user=${auth.userId} tenant=${auth.tenantId}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToTenant(tenantId: string, event: string, payload: Record<string, any>) {
    this.logger.debug(`Emit '${event}' to tenant ${tenantId}`);

    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: Record<string, any>) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  sendTenantNotification(tenantId: string, data: TenantNotification) {
    this.emitToTenant(tenantId, 'tenant-notification', data);

    this.logger.log(`Sent notification to tenant ${tenantId}: ${data.message}`);
  }

  private extractAuth(
    client: Socket,
  ): { userId: string; tenantId: string } | null {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) return null;

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key.trim(), decodeURIComponent(val.join('='))];
        }),
      );

      const token = cookies['access_token'];
      if (!token) return null;

      const payload = this.jwt.verify(token);

      return {
        userId: payload.sub,
        tenantId: payload.tenantId,
      };
    } catch {
      return null;
    }
  }
}
