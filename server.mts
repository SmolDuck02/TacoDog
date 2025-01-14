import { Redis } from "@upstash/redis";
import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ChatHistory } from "./lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
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
    console.log(`A user connected ${socket.id}`);

    socket.on("sendChat", async (data) => {
      console.log("ChatMessage received:", data);

      let chatHistory: ChatHistory[] = (await redis.get(`chatHistory:${data.chatUsersID}`)) || [];
      chatHistory.push(data.newChatMessage);

      await redis.set(`chatHistory:${data.chatUsersID}`, chatHistory);
      console.log("Pushed new chat to history");
      io.emit(`receiveChat:${data.chatUsersID}`, data.newChatMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
