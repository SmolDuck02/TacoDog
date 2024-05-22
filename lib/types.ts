export interface User {
  id: number;
  username: string;
}

export interface Chat {
  chat: string;
  user: User;
  time?: string;
}
