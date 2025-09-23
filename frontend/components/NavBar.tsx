"use client"
import Link from "next/link"
import { Heart, Search, History, User, MessageCircle, Bell, MessageCircleQuestion } from "lucide-react"
import { useUser } from "@/context/UserContext"
import LogoutButton from "@/components/LogoutButton"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"

export default function NavBar() {
  const user = useUser()
  const [hasUnread, setHasUnread] = useState(false)

  // Fetch unread messages
  const fetchUnread = async () => {
    if (!user) {
      setHasUnread(false)
      return
    }

    try {
      const data = await apiGet<{ has_unread: boolean; count: number }>("/conversaciones/unread/")
      setHasUnread(data.has_unread)
    } catch {
      setHasUnread(false)
    }
  }

  useEffect(() => {
    fetchUnread()
  }, [user])

  // Listen for unread status refresh events
  useEffect(() => {
    const handleRefreshUnread = () => {
      fetchUnread()
    }

    window.addEventListener('refreshUnreadStatus', handleRefreshUnread)
    return () => window.removeEventListener('refreshUnreadStatus', handleRefreshUnread)
  }, [user])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href={user ? (user.es_cuidador ? "/cuidador/dashboard" : "/cliente/dashboard") : "/"} className="flex items-center">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FindCare</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {!user && (
              <>
                <Link href="/" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Search className="h-4 w-4 mr-1" /> Inicio
                </Link>
                <Link href="/sobre" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <MessageCircleQuestion className="h-4 w-4 mr-1" /> Sobre Nosotros
                </Link>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <User className="h-4 w-4 mr-1" /> Ingresar
                </Link>
              </>
            )}

            {user && user.es_cliente && (
              <>
                <Link href="/cliente/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <Link href="/cliente/buscar" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Search className="h-4 w-4 mr-1" /> Buscar Cuidadores
                </Link>
                <Link href="/cliente/historial" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <History className="h-4 w-4 mr-1" /> Historial
                </Link>
                <Link href="/cliente/perfil" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <User className="h-4 w-4 mr-1" /> Mi Perfil
                </Link>
                <Link href="/cliente/chat" className="text-gray-600 hover:text-blue-600 flex items-center">
                  {hasUnread ? (
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-1" />
                  )}
                  Mensajes
                </Link>
                <LogoutButton />
              </>
            )}

            {user && user.es_cuidador && (
              <>
                <Link href="/cuidador/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> Dashboard
                </Link>
                <Link href="/cuidador/solicitudes" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <Bell className="h-4 w-4 mr-1" /> Solicitudes
                </Link>
                <Link href="/cuidador/historial" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <History className="h-4 w-4 mr-1" /> Historial
                </Link>
                <Link href="/cuidador/perfil" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <User className="h-4 w-4 mr-1" /> Mi Perfil
                </Link>
                <Link href="/cuidador/chat" className="text-gray-600 hover:text-blue-600 flex items-center">
                  {hasUnread ? (
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-1" />
                  )}
                  Mensajes
                </Link>
                <LogoutButton />
              </>
            )}
            {user && !user.es_cuidador && !user.es_cliente && (
              <LogoutButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}


