"use client";
import { Redis } from "@upstash/redis";
import { createContext, useContext, useEffect, useState } from "react";
import { getAllUsers } from "../api";
import { User } from "../types";

type PropsType = {
  children: React.ReactNode;
};

type UserContextType = {
  users: User[];
  isLoading: boolean;
  error: Error | null;
};

const initialContext: UserContextType = {
  users: [],
  isLoading: true,
  error: null,
};

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

export const UserContext = createContext<UserContextType>(initialContext);

export function UserContextProvider({ children }: PropsType) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data as User[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch users"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const contextValue = {
    users,
    isLoading,
    error,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserContextProvider");
  }
  return context;
}
