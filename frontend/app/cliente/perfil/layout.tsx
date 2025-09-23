import type React from "react"
import { requireRole } from "@/lib/auth-server"

export default async function ClientePerfilLayout({ children }: { children: React.ReactNode }) {
  await requireRole("cliente")
  return children
}



