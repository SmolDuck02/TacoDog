import { Redis } from "@upstash/redis";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const iconLarge = 28;
export const iconSmall = 18;
export const iconMedium = 22;

export const avatars = [
  { img: "/avatars/defaultAvatar.png", name: "Jacket" },
  { img: "/avatars/avatarOne.png", name: "Snacks" },
  { img: "/avatars/avatarTwo.png", name: "Cream" },
  { img: "/avatars/avatarThree.png", name: "Pizza" },
];

export const banners = [
  { img: "/bg/defaultBG.avif", name: "Moss", source: "Maksim Samuilionak" },
  { img: "/bg/plant.jpg", name: "Plant", source: "Junel Mujar" },
  { img: "/bg/shore.jpg", name: "Shore", source: "Marc Kleen" },
  { img: "/bg/sea.jpg", name: "Sea", source: "Rafael Garcin" },
];

export const TacoDog = {
  id: "0",
  username: "TacoDog",
  avatar: { img: "/avatars/tacoAvatar.webp", name: "Taco" },
  banner: { img: "/bg/tacoBG.jpg", name: "Taco", source: "Ingmar H" },
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

export function chatUsersIDBuilder(currentUserID: string, activeChatUserID: string) {
  return `_${[currentUserID, activeChatUserID].sort().join("_")}_`;
}

export const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

// Update the getImageSrc function to handle old Next.js static paths
export function getImageSrc(img: any): string {
  // If it's a string, normalize it
  if (typeof img === 'string') {
    return normalizeImagePath(img);
  }
  // If it's a StaticImageData object or serialized object, extract src
  if (img && typeof img === 'object' && 'src' in img) {
    return normalizeImagePath(img.src);
  }
  // Fallback
  return '/avatars/defaultAvatar.png';
}

// New function to normalize old Next.js static paths to public paths
function normalizeImagePath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '/avatars/defaultAvatar.png';
  }

  // If it's already a public path, return as-is
  if (path.startsWith('/avatars/') || path.startsWith('/bg/')) {
    return path;
  }

  // Handle old Next.js static media paths
  // Pattern: /_next/static/media/filename.hash.ext
  if (path.includes('/_next/static/media/')) {
    const filename = path.split('/_next/static/media/')[1];
    
    // Extract base filename before hash (e.g., "avatarThree.6034fbc6.png" -> "avatarThree")
    const baseName = filename.split('.')[0];
    
    // Map to public folder paths
    const avatarMap: Record<string, string> = {
      'defaultAvatar': '/avatars/defaultAvatar.png',
      'avatarOne': '/avatars/avatarOne.png',
      'avatarTwo': '/avatars/avatarTwo.png',
      'avatarThree': '/avatars/avatarThree.png',
      'tacoAvatar': '/avatars/tacoAvatar.webp',
    };
    
    const bannerMap: Record<string, string> = {
      'defaultBG': '/bg/defaultBG.avif',
      'plant': '/bg/plant.jpg',
      'sea': '/bg/sea.jpg',
      'shore': '/bg/shore.jpg',
      'tacoBG': '/bg/tacoBG.jpg',
    };
    
    // Check avatar map first
    if (avatarMap[baseName]) {
      return avatarMap[baseName];
    }
    
    // Check banner map
    if (bannerMap[baseName]) {
      return bannerMap[baseName];
    }
    
    // If not found, try to infer from filename
    if (baseName.includes('avatar') || baseName.includes('Avatar')) {
      return `/avatars/${baseName}.png`;
    }
    
    if (baseName.includes('BG') || baseName.includes('banner')) {
      return `/bg/${baseName}.jpg`;
    }
  }

  // If it's a relative path that doesn't start with /, add /avatars/ prefix
  if (!path.startsWith('/')) {
    // Check if it looks like a banner path
    if (path.toLowerCase().includes('bg') || path.toLowerCase().includes('banner')) {
      return `/bg/${path}`;
    }
    return `/avatars/${path}`;
  }

  // Return fallback - check if path contains banner keywords
  const lowerPath = path.toLowerCase();
  if (lowerPath.includes('bg') || lowerPath.includes('banner')) {
    return '/bg/defaultBG.avif';
  }

  // Return fallback for unrecognized paths
  return '/avatars/defaultAvatar.png';
}