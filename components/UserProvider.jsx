"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem("sulail_user_name");
    if (savedName) setUser({ full_name: savedName });

    function handleUserUpdate() {
      const updatedName = localStorage.getItem("sulail_user_name");
      if (updatedName) setUser({ full_name: updatedName });
    }
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}