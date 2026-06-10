import { FastifyInstance } from "fastify";

interface ScreenConnection {
  screenId: string;
  socket: WebSocket;
}

const connections = new Map<string, Set<WebSocket>>();

export function setupWebSocket(fastify: FastifyInstance) {
  fastify.get("/ws/screen/:screenId", { websocket: true }, (socket, request) => {
    const { screenId } = request.params as { screenId: string };
    const query = request.query as { token?: string };
    
    if (query.token) {
      try {
        const decoded = (fastify.jwt as any).verify(query.token) as { screenId: string; orgId: string; type: string };
        if (decoded.type !== "screen" || decoded.screenId !== screenId) {
          socket.close(4001, "Invalid token");
          return;
        }
      } catch {
        socket.close(4001, "Invalid token");
        return;
      }
    }
    
    if (!connections.has(screenId)) {
      connections.set(screenId, new Set());
    }
    connections.get(screenId)!.add(socket);
    console.log(`Screen ${screenId} connected via WS`);

    const pingInterval = setInterval(() => {
      try {
        if (socket.readyState === 1) {
          socket.ping();
        }
      } catch {
        clearInterval(pingInterval);
      }
    }, 30000);

    socket.on("message", (data: string) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === "heartbeat") {
          socket.send(JSON.stringify({ type: "heartbeat_ack" }));
        }
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }
    });

    socket.on("close", () => {
      clearInterval(pingInterval);
      connections.get(screenId)?.delete(socket);
      if (connections.get(screenId)?.size === 0) {
        connections.delete(screenId);
      }
      console.log(`Screen ${screenId} disconnected`);
    });
  });

  return {
    notifyScreen(screenId: string, event: object) {
      const sockets = connections.get(screenId);
      if (!sockets) return;
      const msg = JSON.stringify(event);
      for (const socket of sockets) {
        try {
          socket.send(msg);
        } catch {
          sockets.delete(socket);
        }
      }
    },
    notifyAllScreens(event: object) {
      const msg = JSON.stringify(event);
      for (const [, sockets] of connections) {
        for (const socket of sockets) {
          try {
            socket.send(msg);
          } catch {
            sockets.delete(socket);
          }
        }
      }
    },
  };
}
