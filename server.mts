import { Redis } from "@upstash/redis";
import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
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
  const io = new Server(httpServer, {
    maxHttpBufferSize: 10 * 1024 * 1024,
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  });

  io.on("connection", async (socket) => {
    // await redis.del(`chatHistory:116`);

    console.log(`A user connected: ${socket.id}`);

    socket.on("sendChat", async (data) => {
      const { activeChatHistory, receiverID, newChatMessage } = data;

      console.log("ChatMessage received:", receiverID, newChatMessage);

      io.emit(`receiveChat:${receiverID}`, newChatMessage);

      if (newChatMessage.type && newChatMessage.type == "call") {
        io.emit(`receiveChat:${newChatMessage.senderID}`, {newChatMessage, receiverID});
      }
      activeChatHistory.push(newChatMessage);

      // await redis.set(`chatHistory:${chatUsersID}`, activeChatHistory);
      // cancel -- await redis.incr("chatCounter:${chatUsersID}");
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
    socket.on("typing", ({ senderID, receiverID, state }) => {
      io.emit(`typing:${receiverID}`, { senderID, state });
    });

    socket.on("seenChat", ({ senderID, index }) => {
      io.emit(`seenChat:${senderID}`, index);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(port, hostname, () => { // Added hostname parameter
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
