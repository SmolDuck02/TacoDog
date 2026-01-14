import type { User as NextAuthUser } from "next-auth";
import { StaticImageData } from "next/image";
export interface User extends NextAuthUser {
  username: string;
  password?: string;
  banner?: { img: StaticImageData | string; name: string; source: string };
  avatar?: { img: StaticImageData | string; name: string };
}
export interface Chat {
  chat: string;
  userID: number;
  time?: string;
}

export interface UserChat {
  user: User;
  chats: ChatHistory[] | null;
}
export interface ChatHistory {
  senderID: string;
  chatMessage?: string;
  date: Date;
  start?: number;
  end?: number;
  isSeen?: boolean;
  isDelivered?: boolean;
  uploads?: (File | string | any)[];
}
export interface RegistrationError {
  show: boolean;
  message?: string;
}
export interface Error {
  error?: { error?: string; errors?: string };
}

export interface CredentialsData {
  formData: string;
  url: string;
}

export type ResponseObject = {
  response: string;
};
export type UserObject = {
  username: string;
  password: string;
  id: string;
};

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}
