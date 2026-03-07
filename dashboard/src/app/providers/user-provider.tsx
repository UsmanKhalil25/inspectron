"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@apollo/client";

import { CURRENT_USER } from "@/graphql/queries/current-user";
type User = {
  id: string;
  email: string;
  name: string;
} | null;

type UserContextType = {
  user: User;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useQuery(CURRENT_USER);

  return (
    <UserContext.Provider value={{ user: data?.currentUser ?? null, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
