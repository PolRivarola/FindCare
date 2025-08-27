// context/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface User {
  id: number;
  username: string;
  es_cuidador: boolean;
  es_cliente: boolean;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiGet<User>("/users/me/")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
