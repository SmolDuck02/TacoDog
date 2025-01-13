import { Redis } from "@upstash/redis";
import { ResponseObject, User } from "../types";

const backendURL = "https://web-production-019a.up.railway.app";

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
    const keys = await redis.keys("*");
    if (keys.length === 0) {
      console.log("No records found");
      return [];
    }
    const values: User[] = await redis.mget(...keys);
    const records = keys
      .filter((key) => !key.includes("id"))
      .map((key, index) => ({ id: values[index].id, username: values[index].username }));
    console.log("This is all user recs", records);
    return records;
  } catch (error) {
    console.error("Error fetching all records:", error);
    return [];
  }
}
