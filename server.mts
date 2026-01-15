import { Redis } from "@upstash/redis";
import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Always use 0.0.0.0 for Render
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  console.log('Next.js app prepared successfully');
  
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    maxHttpBufferSize: 5 * 1024 * 1024, // Reduced to 5MB
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  httpServer.on('error', (error) => {
    console.error('HTTP Server Error:', error);
  });

  io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("sendChat", (data) => {
      try {
        const { activeChatHistory, receiverID, newChatMessage } = data;
        io.emit(`receiveChat:${receiverID}`, newChatMessage);
        if (newChatMessage.type && newChatMessage.type == "call") {
          io.emit(`receiveChat:${newChatMessage.senderID}`, {newChatMessage, receiverID});
        }
        activeChatHistory.push(newChatMessage);
      } catch (error) {
        console.error('Error in sendChat:', error);
      }
    });

    socket.on("call", ({ receiverID, caller }) => {
      try {
        io.emit(`receiveCall:${receiverID}`, caller);
      } catch (error) {
        console.error('Error in call:', error);
      }
    });

    socket.on(`acceptCall`, (data) => {
      try {
        io.emit(`acceptCall`, data);
      } catch (error) {
        console.error('Error in acceptCall:', error);
      }
    });

    socket.on(`rejectCall`, (callerID) => {
      try {
        io.emit(`rejectCall:${callerID}`);
      } catch (error) {
        console.error('Error in rejectCall:', error);
      }
    });

    socket.on("typing", ({ senderID, receiverID, state }) => {
      try {
        io.emit(`typing:${receiverID}`, { senderID, state });
      } catch (error) {
        console.error('Error in typing:', error);
      }
    });

    socket.on("seenChat", ({ senderID, index }) => {
      try {
        io.emit(`seenChat:${senderID}`, index);
      } catch (error) {
        console.error('Error in seenChat:', error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Memory limit: ${process.env.NODE_OPTIONS || 'default'}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  console.error('Error details:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Keep process alive
setInterval(() => {
  if (process.memoryUsage().heapUsed > 350 * 1024 * 1024) { // 350MB
    console.warn('Memory usage high:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
  }
}, 30000); // Log every 30 seconds