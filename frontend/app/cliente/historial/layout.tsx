import type React from "react"
import { requireRole } from "@/lib/auth-server"

export default async function ClienteHistorialLayout({ children }: { children: React.ReactNode }) {
  await requireRole("cliente")
  return children
}



