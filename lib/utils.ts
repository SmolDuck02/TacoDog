import avatarOne from "@/public/avatars/avatarOne.png";
import avatarThree from "@/public/avatars/avatarThree.png";
import avatarTwo from "@/public/avatars/avatarTwo.png";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import defaultBanner from "@/public/bg/defaultBG.avif";
import plant from "@/public/bg/plant.jpg";
import sea from "@/public/bg/sea.jpg";
import shore from "@/public/bg/shore.jpg";
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
  { img: defaultBanner, name: "Moss", source: "Maksim Samuilionak" },
  { img: plant, name: "Plant", source: "Junel Mujar" },
  { img: shore, name: "Shore", source: "Marc Kleen" },
  { img: sea, name: "Sea", source: "Rafael Garcin" },
];
