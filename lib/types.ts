import type { User as NextAuthUser } from "next-auth";
export interface User extends NextAuthUser {
  username: string;
  password?: string;
}

export interface Chat {
  chat: string;
  user: User;
  time?: string;
}

export interface ChatHistory {
  senderID: string;
  chatMessage: string;
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
