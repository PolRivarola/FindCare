import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateChat(tipoUsuario: "cliente" | "cuidador") {
  const router = useRouter();

  const crearChat = async (userId: number) => {
    try {
      const res = await fetch("/api/b/conversaciones/ensure/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) {
        throw new Error("Error al crear conversación");
      }
      const data = await res.json();
      router.push(`/${tipoUsuario}/chat?c=${data.id}`);
    } catch {
      toast.error("No se pudo abrir el chat");
    }
  };

  return { crearChat };
}

