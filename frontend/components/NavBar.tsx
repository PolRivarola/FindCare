"use client"
import Link from "next/link"
import { Heart, Search, History, User, MessageCircle, Bell, MessageCircleQuestion } from "lucide-react"
import { useUserContext } from "@/context/UserContext"
import LogoutButton from "@/components/LogoutButton"
import { NavLink } from "@/components/NavLink"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"

export default function NavBar() {
  const { user, isLoading } = useUserContext()
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
            <Heart className="h-8 w-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded text-white p-1 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FindCare</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {isLoading ? (
              // Show loading state to prevent flash of wrong content
              <div className="flex items-center space-x-6">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : !user ? (
              <>
                <NavLink href="/" icon={Search}>
                  Inicio
                </NavLink>
                <NavLink href="/sobre" icon={MessageCircleQuestion}>
                  Sobre Nosotros
                </NavLink>
                <NavLink href="/login" icon={User}>
                  Ingresar
                </NavLink>
              </>
            ) : null}

            {user && user.es_cliente && (
              <>
                <NavLink href="/cliente/dashboard" icon={Heart}>
                  Dashboard
                </NavLink>
                <NavLink href="/cliente/buscar" icon={Search}>
                  Buscar Cuidadores
                </NavLink>
                <NavLink href="/cliente/historial" icon={History}>
                  Historial
                </NavLink>
                <NavLink href="/cliente/perfil" icon={User}>
                  Mi Perfil
                </NavLink>
                <NavLink href="/cliente/chat" icon={MessageCircle} hasUnread={hasUnread}>
                  Mensajes
                </NavLink>
                <LogoutButton />
              </>
            )}

            {user && user.es_cuidador && (
              <>
                <NavLink href="/cuidador/dashboard" icon={Heart}>
                  Dashboard
                </NavLink>
                <NavLink href="/cuidador/solicitudes" icon={Bell}>
                  Solicitudes
                </NavLink>
                <NavLink href="/cuidador/historial" icon={History}>
                  Historial
                </NavLink>
                <NavLink href="/cuidador/perfil" icon={User}>
                  Mi Perfil
                </NavLink>
                <NavLink href="/cuidador/chat" icon={MessageCircle} hasUnread={hasUnread}>
                  Mensajes
                </NavLink>
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


