"use server";
// import ava from "@/public/avatars/tacodog.png";
// import bg from "@/public/bg/tacodog.jpg";
import { ChatHistory, User, UserChat } from "../types";
import { avatars, banners, redis, TacoDog } from "../utils";
const bcrypt = require("bcrypt");

export async function saveProfileChanges(user: User) {
  const status = await redis.set(`user:${user.id}`, user);
  console.log("Update profile is ", status);
}

export async function registerUser(formData: User) {
  // const u = await redis.keys(`user*`);
  // if (u.length > 0) await redis.del(...u);
  // const x = await redis.keys(`chat*`);
  // if (x.length > 0) await redis.del(...x);
  try {
    const { username, password } = formData;
    const hashedPassword = await bcrypt.hash(password || "", 10);

    const users = await redis.keys(`user:*`);
    let user;

    if (users.length > 0) {
      const values: User[] = await redis.mget(...users);
      user = values.find((value) => {
        return value.username == username;
      });
    }

    console.log(formData, users, user);

    if (user) {
      console.log("Username already taken!", user.username);
      return { error: "Username already taken!" };
    }

    const id = await redis.incr("userCounter:id");
    await redis.set(`user:${id}`, {
      id,
      username,
      password: hashedPassword,
      avatar: avatars[id % avatars.length],
      banner: banners[id % banners.length],
    });

    return { success: "Registration successful" };
  } catch (error) {
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const cachedUsers = await redis.get("cachedUsers");

    if (cachedUsers) {
      console.log("Returning cached users...");
      return cachedUsers as User[];
    }

    const keys = await redis.keys("user:*");
    const values: User[] = await redis.mget(...keys);

    if (!values) return new Error("No users found!");

    const records = keys.map((_, index) => ({
      id: values[index].id,
      username: values[index].username,
      avatar: values[index].avatar,
      banner: values[index].banner,
    }));

    console.log("Returning users ...");
    await redis.set("cachedUsers", records, { ex: 60 * 60 * 24 });
    return records;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function getActiveChatHistory(chatUsers: string) {
  try {
    const chatHistory = (await redis.get(`chatHistory:${chatUsers}`)) as ChatHistory[];
    return chatHistory;
  } catch (error) {
    console.error(`Error fetching chat history with ${chatUsers}`, error);
    return null;
  }
}

export async function getUserChats(id: string) {
  try {
    const cachedUserChats = await redis.get(`cachedUserChats:${id}`);

    if (cachedUserChats) {
      console.log("Returning cached user chats...");
      return cachedUserChats as UserChat[];
    }

    const pattern = `_${id}_`;
    const keys = await redis.keys(`chatHistory*${pattern}*`);

    if (!keys || keys.length === 0) {
      console.log("No user chats found with ", id, pattern);
      return [{ user: TacoDog, chats: null }];
    }

    const chats: [ChatHistory[]] = await redis.mget(...keys);
    const userIDs = keys.map((k) => {
      const ids = k.split("_").filter((i) => !isNaN(Number(i)));
      return ids[0] == id ? ids[1] : ids[0];
    });
    const rawUsers: User[] = await redis.mget(...userIDs.map((id) => `user:${id}`));
    const users = rawUsers.map((user, index) => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      banner: user.banner,
    }));

    const userChats = users.map((user, index) => {
      return { user: user, chats: chats[index] };
    });

    userChats.sort(
      (a, b) =>
        new Date(b.chats![b.chats!.length - 1].date).getTime() -
        new Date(a.chats![a.chats!.length - 1].date).getTime()
    );

    await redis.set(`cachedUserChats:${id}`, userChats, { ex: 60 * 60 * 24 });
    return userChats;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "You are an social person named TacoDog but users call you 't' or '@t' or '@tacodog'. You are to help and guide the users of their queries. Just use plain text, no characters that make text bold or italic, just plain text",
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
