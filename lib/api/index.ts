"use server";
// import ava from "@/public/avatars/tacodog.png";
// import bg from "@/public/bg/tacodog.jpg";
import { ChatHistory, User } from "../types";
import { avatars, banners, redis } from "../utils";
const bcrypt = require("bcrypt");
export async function saveProfileChanges(user: User) {
  const updatedUser = await redis.set(`user:${user.username}`, user);
  console.log(updatedUser);
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
    const keys = await redis.keys("user:*");
    const values: User[] = await redis.mget(...keys);

    if (!values) return null;

    const records = keys.map((_, index) => ({
      id: values[index].id,
      username: values[index].username,
      avatar: values[index].avatar,
      banner: values[index].banner,
    }));

    console.log("all users fetched successful");
    return records;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return null;
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
    const pattern = `_${id}_`;
    const keys = await redis.keys(`chatHistory*${pattern}*`);

    if (!keys || keys.length === 0) {
      console.log("No user chats found with ", id, pattern);
      return null;
    }

    const chats: [ChatHistory[]] = await redis.mget(...keys);

    const userIDs = keys.map((k) => {
      const ids = k.split("_").filter((i) => !isNaN(Number(i)));
      return ids[0] == id ? ids[1] : ids[0];
    });

    const users: User[] = (await Promise.all(
      userIDs.map((id) => redis.get(`user:${id}`))
    )) as User[];

    // console.log("user chats: ", userIDs, userChats, keys);

    const userChats = users.map((user, index) => {
      return { user: user, chats: chats[index] };
    });

    return userChats;
  } catch (error) {
    console.error("error fetching user chats ", error);
    return null;
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
