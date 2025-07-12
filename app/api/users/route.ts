import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

//extract the cache logic to a separate function
//need a try catch so that if the cache fails, it doesn't break the whole API
//this is useful for debugging and also for production where the cache might be down
async function tryGetCache(key: string) {
  try {
    const value = await redis.get(key);
    console.log("📦 Cache hit:", key);
    return value;
  } catch (err) {
    console.warn("⚠️ Redis cache failed:", err);
    return null;
  }
}

export async function GET() {
  try {
    const cachedUsers = await tryGetCache("cachedUsers");

    if (cachedUsers) {
      return NextResponse.json(cachedUsers);
    }

    const keys = await redis.keys("user:*");
    const values = await redis.mget(...keys);

    if (!values) {
      return new NextResponse("No users found!", { status: 404 });
    }

    const records = keys.map((_, index) => {
      const user = values[index] as any;
      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        banner: user.banner,
      };
    });

    await redis.set("cachedUsers", records, { ex: 60 * 60 * 24 });
    return NextResponse.json(records);
  } catch (error) {
    return new NextResponse("Error getting users: " + (error as Error).message, {
      status: 500,
    });
  }
}
