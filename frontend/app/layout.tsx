import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FindCare - Conectamos familias con cuidadores profesionales",
  description:
    "Plataforma para conectar familias con cuidadores verificados para el cuidado de personas mayores y con discapacidad",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-center"  /></body>
      
    </html>
  )
}
