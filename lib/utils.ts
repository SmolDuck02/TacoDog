import avatarOne from "@/public/avatars/avatarOne.png";
import avatarThree from "@/public/avatars/avatarThree.png";
import avatarTwo from "@/public/avatars/avatarTwo.png";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import tacoAvatar from "@/public/avatars/tacoAvatar.png";
import defaultBannerIMG from "@/public/bg/defaultBG.avif";
import plant from "@/public/bg/plant.jpg";
import sea from "@/public/bg/sea.jpg";
import shore from "@/public/bg/shore.jpg";
import tacoBG from "@/public/bg/tacoBG.jpg";
import { Redis } from "@upstash/redis";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const iconSize = 28;
export const iconSizeSmall = 18;

export const avatars = [
  { img: defaultAvatar, name: "Jacket" },
  { img: avatarOne, name: "Snacks" },
  { img: avatarTwo, name: "Cream" },
  { img: avatarThree, name: "Pizza" },
];
export const banners = [
  { img: defaultBannerIMG, name: "Moss", source: "Maksim Samuilionak" },
  { img: plant, name: "Plant", source: "Junel Mujar" },
  { img: shore, name: "Shore", source: "Marc Kleen" },
  { img: sea, name: "Sea", source: "Rafael Garcin" },
];

export const TacoDog = {
  id: "0",
  username: "TacoDog",
  avatar: { img: tacoAvatar, name: "Taco" },
  banner: { img: tacoBG, name: "Taco", source: "Ingmar H" },
};

export const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

export const dateTimeOptions: Intl.DateTimeFormatOptions = {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};
export const yearDateOptions: Intl.DateTimeFormatOptions = {
  month: "numeric",
  year: "numeric",
};
export const monthDateOptions: Intl.DateTimeFormatOptions = {
  month: "numeric",
  day: "numeric",
};
export const timeOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};
export async function initializeCamera(videoRef: HTMLVideoElement) {
  try {
    // Get all available video input devices (cameras)
    const cameras = await getConnectedDevices("videoinput");
    if (cameras.length === 0) {
      console.warn("No cameras found.");
      return;
    }

    console.log("g", cameras);
    // Open the first available camera with a resolution of 1280x720
    const stream = await openCamera(cameras[0].deviceId, 1280, 720);

    // Play the stream in a video element
    if (videoRef) {
      videoRef.srcObject = stream;
      videoRef.play();
    } else {
      console.warn("No video element found.");
    }
  } catch (error) {
    console.error("Error initializing camera:", error);
  }
}

async function getConnectedDevices(type: MediaDeviceKind) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === type);
}

// Open camera with specified resolution and device ID
async function openCamera(deviceId: string, minWidth: number, minHeight: number) {
  const constraints = {
    audio: { echoCancellation: true },
    video: {
      deviceId: { ideal: deviceId }, // Ensure the correct camera is used
      width: { ideal: minWidth },
      height: { ideal: minHeight },
      facingMode: "user",
    },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error opening camera:", error);
    throw error; // Rethrow the error for handling by the caller
  }
}
