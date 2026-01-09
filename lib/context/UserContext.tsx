"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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

export const UserContext = createContext<UserContextType>(initialContext);

export function UserContextProvider({ children }: PropsType) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchUsers() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data as User[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Someting went wrong :/"));
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
