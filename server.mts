import { Redis } from "@upstash/redis";
import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const httpServer = createServer(handler);
  const io = new Server(httpServer, { connectionStateRecovery: {} });

  io.on("connection", async (socket) => {
    // await redis.del(`chatHistory:116`);

    console.log(`A user connected: ${socket.id}`);

    socket.on("sendChat", async (data) => {
      const { activeChatHistory, chatUsersID, newChatMessage } = data;

      console.log("ChatMessage received:", chatUsersID, newChatMessage);

      io.emit(`receiveChat:${chatUsersID}`, newChatMessage);

      activeChatHistory.push(newChatMessage);

      await redis.set(`chatHistory:${chatUsersID}`, activeChatHistory);
      console.log(activeChatHistory, `Successfully pushed new chat to history`);
    });

    socket.on("call", ({ receiverID, caller }) => {
      io.emit(`receiveCall:${receiverID}`, caller);
    });

    socket.on(`acceptCall`, (data) => {
      io.emit(`acceptCall`, data);
    });
    socket.on(`rejectCall`, (callerID) => {
      io.emit(`rejectCall:${callerID}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
