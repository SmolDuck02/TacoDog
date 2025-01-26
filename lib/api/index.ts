import { Redis } from "@upstash/redis";
import { User } from "../types";

export const TacoDog = { id: "0", username: "TacoDog" };

export const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

export async function saveProfileChanges(user: User) {
  const updatedUser = await redis.set(`user:${user.username}`, user);
  console.log(updatedUser);
}

export async function getAllUsers() {
  try {
    const keys = await redis.keys("user:*");

    if (keys.length === 0) {
      console.log("No records found");
      return [];
    }

    const values: User[] = await redis.mget(...keys);
    const records = keys.map((_, index) => ({
      id: values[index].id,
      username: values[index].username,
      avatar: values[index].avatar,
      banner: values[index].banner,
    }));

    return records;
  } catch (error) {
    console.error("Error fetching all records:", error);
    return [];
  }
}

export async function getActiveChatHistory(chatUsers: string) {
  try {
    const chatHistory = await redis.get(`chatHistory:${chatUsers}`);
    return chatHistory;
  } catch (error) {
    console.error(`Error fetching chat history with ${chatUsers}`, error);
    return [];
  }
}

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "You are an social person named TacoDog but users call you 't' or '@t'. You are to help and guide the users of their queries. Just use plain text, no characters that make text bold or italic, just plain text",
});

export async function askTacoDog(prompt: string) {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const result = await chat.sendMessage(prompt.slice(1));
  return { senderID: "TacoDog", chatMessage: result.response.text() };
}
