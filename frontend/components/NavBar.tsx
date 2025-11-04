"use client"
import Link from "next/link"
import { Heart, Search, History, User, MessageCircle, Bell, MessageCircleQuestion, Menu, X } from "lucide-react"
import { useUserContext } from "@/context/UserContext"
import LogoutButton from "@/components/LogoutButton"
import { NavLink } from "@/components/NavLink"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"

export default function NavBar() {
  const { user, isLoading } = useUserContext()
  const [hasUnread, setHasUnread] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Add a small delay after user loads to sync with page content loading
  // This prevents the navbar from looking "ready" before page content loads
  useEffect(() => {
    if (!isLoading && user) {
      // Delay to sync with dashboard pages fetching their data
      // Dashboard pages start loading after user is available
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 500)
      return () => clearTimeout(timer)
    } else if (!isLoading && !user) {
      // If no user, we can show immediately
      setIsInitialLoad(false)
    }
  }, [isLoading, user])

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
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <Link href={user ? (user.es_cuidador ? "/cuidador/dashboard" : "/cliente/dashboard") : "/"} className="flex items-center">
            <Heart className="h-6 w-6 md:h-8 md:w-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded text-white p-1 mr-2" />
            <span className="text-xl md:text-2xl font-bold text-gray-900">FindCare</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isLoading || isInitialLoad ? (
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

            {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-3">
              {isLoading || isInitialLoad ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : !user ? (
                <>
                  <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Search className="h-5 w-5 text-gray-600" />
                    <span>Inicio</span>
                  </Link>
                  <Link href="/sobre" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <MessageCircleQuestion className="h-5 w-5 text-gray-600" />
                    <span>Sobre Nosotros</span>
                  </Link>
                  <Link href="/login" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Ingresar</span>
                  </Link>
                </>
              ) : null}

              {user && user.es_cliente && (
                <>
                  <Link href="/cliente/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/cliente/buscar" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Search className="h-5 w-5 text-gray-600" />
                    <span>Buscar Cuidadores</span>
                  </Link>
                  <Link href="/cliente/historial" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <History className="h-5 w-5 text-gray-600" />
                    <span>Historial</span>
                  </Link>
                  <Link href="/cliente/perfil" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Mi Perfil</span>
                  </Link>
                  <Link href="/cliente/chat" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors relative" onClick={() => setMobileMenuOpen(false)}>
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                    <span>Mensajes</span>
                    {hasUnread && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                  <div className="px-4"><LogoutButton /></div>
                </>
              )}

              {user && user.es_cuidador && (
                <>
                  <Link href="/cuidador/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/cuidador/solicitudes" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span>Solicitudes</span>
                  </Link>
                  <Link href="/cuidador/historial" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <History className="h-5 w-5 text-gray-600" />
                    <span>Historial</span>
                  </Link>
                  <Link href="/cuidador/perfil" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Mi Perfil</span>
                  </Link>
                  <Link href="/cuidador/chat" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors relative" onClick={() => setMobileMenuOpen(false)}>
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                    <span>Mensajes</span>
                    {hasUnread && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Link>
                  <div className="px-4"><LogoutButton /></div>
                </>
              )}

              {user && !user.es_cuidador && !user.es_cliente && (
                <div className="px-4"><LogoutButton /></div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}


