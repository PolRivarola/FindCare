"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserContext } from "@/context/UserContext";

export default function LogoutButton() {
  const router = useRouter();
  const { refreshUser } = useUserContext();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await refreshUser(); // Refresh user context to update navbar
    } catch (e) {
      toast.error("Error al cerrar sesión");
    } finally {
      router.replace("/login");
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline" className="ml-4">
      Cerrar sesión
    </Button>
  );
}


