import { Redis } from "@upstash/redis";
import { ResponseObject, User } from "../types";

const backendURL = "https://web-production-019a.up.railway.app";
export const TacoDog = { id: "0", username: "TacoDog" };

export async function askMe(userMessage: string): Promise<ResponseObject> {
  console.log("AskMe user message: ", userMessage);
  const response = await fetch(`${backendURL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMessage }),
  });

  if (!response.ok) {
    return { response: "error" };
  }

  const data: ResponseObject = await response.json();
  return data;
}

export const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

export async function getAllUsers() {
  try {
    const keys = await redis.keys("user:*");
    console.log(keys);
    if (keys.length === 0) {
      console.log("No records found");
      return [];
    }
    const values: User[] = await redis.mget(...keys);
    const records = keys.map((key, index) => ({
      id: values[index].id,
      username: values[index].username,
    }));
    console.log("This is all user recs", records);
    return records;
  } catch (error) {
    console.error("Error fetching all records:", error);
    return [];
  }
}

export async function getActiveChatHistory(chatUsers: string) {
  try {
    const chatHistory = await redis.get(`chatHistory:${chatUsers}`);
    console.log(`This is chat history with ${chatUsers}`, chatHistory);
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
    "You are an social person named TacoDog. You are to help and guide the users of their queries.",
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
