import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
  
    if (token !== process.env.KEEP_ALIVE_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await redis.set("keepAlive", Date.now());
    console.log("Redis keep-alive pinged at", new Date().toISOString());

    return NextResponse.json({ message: "Redis pinged successfully!" });
  } catch (err) {
    return new NextResponse("Failed to ping Redis", { status: 500 });
  }
}
