import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  WSMessageType,
  type StartScreencastMessage,
  type StopScreencastMessage,
  type ScreencastFrameMessage,
  type ScreencastStartedMessage,
  type ScreencastStoppedMessage,
  type ScreencastErrorMessage,
} from "shared";

export type ScreencastStatus = "idle" | "connecting" | "active" | "error";

export interface UseScreencastOptions {
  url: string;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  autoConnect?: boolean;
}

export interface UseScreencastReturn {
  status: ScreencastStatus;
  error: string | null;
  currentFrame: string | null;
  startScreencast: () => void;
  stopScreencast: () => void;
  isConnected: boolean;
}

export function useScreencast({
  url,
  quality = 60,
  maxWidth = 1280,
  maxHeight = 720,
  autoConnect = false,
}: UseScreencastOptions): UseScreencastReturn {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<ScreencastStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:3001/screencast", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setStatus("idle");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setStatus("idle");
    });

    socket.on(
      WSMessageType.SCREENCAST_FRAME,
      (message: ScreencastFrameMessage) => {
        setCurrentFrame(message.payload.data);
        setStatus("active");
      },
    );

    socket.on(
      WSMessageType.SCREENCAST_STARTED,
      (message: ScreencastStartedMessage) => {
        console.log("Screencast started:", message.payload);
        setStatus("active");
        setError(null);
      },
    );

    socket.on(
      WSMessageType.SCREENCAST_STOPPED,
      (message: ScreencastStoppedMessage) => {
        console.log("Screencast stopped:", message.payload);
        setStatus("idle");
        setCurrentFrame(null);
      },
    );

    socket.on(
      WSMessageType.SCREENCAST_ERROR,
      (message: ScreencastErrorMessage) => {
        console.error("Screencast error:", message.payload.error);
        setError(message.payload.error);
        setStatus("error");
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const startScreencast = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      console.error("Socket not connected");
      return;
    }

    setStatus("connecting");
    setError(null);

    const message: StartScreencastMessage = {
      type: WSMessageType.START_SCREENCAST,
      payload: {
        url,
        quality,
        maxWidth,
        maxHeight,
      },
    };

    socketRef.current.emit(WSMessageType.START_SCREENCAST, message);
  }, [url, quality, maxWidth, maxHeight, isConnected]);

  const stopScreencast = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      console.error("Socket not connected");
      return;
    }

    const message: StopScreencastMessage = {
      type: WSMessageType.STOP_SCREENCAST,
      payload: {},
    };

    socketRef.current.emit(WSMessageType.STOP_SCREENCAST, message);
  }, [isConnected]);

  useEffect(() => {
    if (autoConnect && isConnected && status === "idle") {
      startScreencast();
    }
  }, [autoConnect, isConnected, status, startScreencast]);

  return {
    status,
    error,
    currentFrame,
    startScreencast,
    stopScreencast,
    isConnected,
  };
}
