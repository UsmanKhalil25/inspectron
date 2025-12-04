import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ScreencastManager } from "core/dist/crawler/screencast-manager";
import {
  WSMessageType,
  type StartScreencastMessage,
  type StopScreencastMessage,
  type ScreencastFrameMessage,
  type ScreencastStartedMessage,
  type ScreencastStoppedMessage,
  type ScreencastErrorMessage,
} from "shared";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "/screencast",
})
export class ScreencastGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScreencastGateway.name);
  private screencastManager: ScreencastManager | null = null;
  private activeClients = new Set<string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.activeClients.add(client.id);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeClients.delete(client.id);

    if (this.activeClients.size === 0 && this.screencastManager) {
      await this.stopScreencastInternal();
    }
  }

  @SubscribeMessage(WSMessageType.START_SCREENCAST)
  async handleStartScreencast(
    @MessageBody() data: StartScreencastMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Starting screencast for URL: ${data.payload.url}`);

      if (this.screencastManager) {
        await this.stopScreencastInternal();
      }

      this.screencastManager = new ScreencastManager();

      await this.screencastManager.launch(false);

      await this.screencastManager.goto(data.payload.url);

      await this.screencastManager.startScreencast(
        {
          format: "jpeg",
          quality: data.payload.quality,
          maxWidth: data.payload.maxWidth,
          maxHeight: data.payload.maxHeight,
        },
        (frame) => {
          const frameMessage: ScreencastFrameMessage = {
            type: WSMessageType.SCREENCAST_FRAME,
            payload: {
              data: frame.data,
              metadata: frame.metadata,
            },
          };
          this.server.emit(WSMessageType.SCREENCAST_FRAME, frameMessage);
        },
      );

      const startedMessage: ScreencastStartedMessage = {
        type: WSMessageType.SCREENCAST_STARTED,
        payload: {
          url: data.payload.url,
          timestamp: Date.now(),
        },
      };
      this.server.emit(WSMessageType.SCREENCAST_STARTED, startedMessage);

      this.logger.log("Screencast started successfully");
    } catch (error) {
      this.logger.error("Error starting screencast:", error);

      const errorMessage: ScreencastErrorMessage = {
        type: WSMessageType.SCREENCAST_ERROR,
        payload: {
          error: error.message || "Failed to start screencast",
          timestamp: Date.now(),
        },
      };
      client.emit(WSMessageType.SCREENCAST_ERROR, errorMessage);
    }
  }

  @SubscribeMessage(WSMessageType.STOP_SCREENCAST)
  async handleStopScreencast(
    @MessageBody() data: StopScreencastMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log("Stopping screencast");
      await this.stopScreencastInternal("user_requested");
    } catch (error) {
      this.logger.error("Error stopping screencast:", error);

      const errorMessage: ScreencastErrorMessage = {
        type: WSMessageType.SCREENCAST_ERROR,
        payload: {
          error: error.message || "Failed to stop screencast",
          timestamp: Date.now(),
        },
      };
      client.emit(WSMessageType.SCREENCAST_ERROR, errorMessage);
    }
  }

  private async stopScreencastInternal(
    reason: "user_requested" | "error" | "completed" = "completed",
  ) {
    if (this.screencastManager) {
      await this.screencastManager.close();
      this.screencastManager = null;

      const stoppedMessage: ScreencastStoppedMessage = {
        type: WSMessageType.SCREENCAST_STOPPED,
        payload: {
          timestamp: Date.now(),
          reason,
        },
      };
      this.server.emit(WSMessageType.SCREENCAST_STOPPED, stoppedMessage);

      this.logger.log("Screencast stopped");
    }
  }
}
