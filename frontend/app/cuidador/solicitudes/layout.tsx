import type React from "react"
import { requireRole } from "@/lib/auth-server"

export default async function CuidadorSolicitudesLayout({ children }: { children: React.ReactNode }) {
  await requireRole("cuidador")
  return children
}



