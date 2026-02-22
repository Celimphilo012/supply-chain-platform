// apps/api/src/modules/realtime/inventory.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'null', null],
    credentials: true,
  },
  namespace: '/',
})
export class InventoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('InventoryGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connected without token — disconnecting`,
        );
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      // Store user info on socket for later use
      client.data.userId = payload.sub;
      client.data.organizationId = payload.organizationId;
      client.data.role = payload.role;

      // Join organization room — this is tenant isolation for WebSockets
      const room = `org:${payload.organizationId}`;
      await client.join(room);

      this.logger.log(
        `Client ${client.id} joined room ${room} (user: ${payload.sub})`,
      );
    } catch (err) {
      this.logger.warn(`Client ${client.id} auth failed — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  // Called by RealtimeService to broadcast to all clients in an org
  emitToOrganization(organizationId: string, event: string, payload: any) {
    this.server.to(`org:${organizationId}`).emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // Client can subscribe to specific product updates
  @SubscribeMessage('subscribe:product')
  handleProductSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() productId: string,
  ) {
    client.join(`product:${productId}`);
    return { event: 'subscribed', data: { productId } };
  }
}
