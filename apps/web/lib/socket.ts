import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
      auth: { token: useAuthStore.getState().accessToken },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  (s.auth as any).token = useAuthStore.getState().accessToken;
  s.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
