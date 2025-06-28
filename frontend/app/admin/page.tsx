"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart, AlertTriangle, Users, Star, TrendingUp, Search } from "lucide-react"
import { toast } from "sonner"
import { apiPut, apiGet } from "@/lib/api"
import { set } from "date-fns"

interface FlaggedRating {
  id: number
  cliente: string
  cuidador: string
  rating: number
  comentario: string
  fecha: string
  reportado: string
  estado: string
}

interface AdminStats {
  totalUsuarios: number
  cuidadoresActivos: number
  clientesActivos: number
  calificacionesPendientes: number
  serviciosCompletados: number
  ingresosMes: string
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingStates, setLoadingStates] = useState<Record<number, "approving" | "deleting" | null>>({})
  const [flaggedRatings, setFlaggedRatings] = useState<FlaggedRating[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsuarios: 0,
    cuidadoresActivos: 0,
    clientesActivos: 0,
    calificacionesPendientes: 0,
    serviciosCompletados: 0,
    ingresosMes: "$0",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const statsData = await apiGet<AdminStats>("/api/admin/stats")
        setStats(statsData)

        const ratingsData = await apiGet<FlaggedRating[]>("/api/admin/flagged-ratings")
        setFlaggedRatings(ratingsData)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast.error("Error al cargar los datos. Mostrando datos de ejemplo.")

        setStats({
          totalUsuarios: 1247,
          cuidadoresActivos: 156,
          clientesActivos: 891,
          calificacionesPendientes: 8,
          serviciosCompletados: 2341,
          ingresosMes: "$45,230",
        })

        setFlaggedRatings([
          {
            id: 1,
            cliente: "Juan Pérez",
            cuidador: "María González",
            rating: 1,
            comentario: "Llegó tarde y no siguió las instrucciones médicas. Muy decepcionante.",
            fecha: "2024-01-15",
            reportado: "Lenguaje inapropiado",
            estado: "Pendiente",
          },
          {
            id: 2,
            cliente: "Ana López",
            cuidador: "Carlos Rodríguez",
            rating: 2,
            comentario: "No estoy satisfecha con el servicio. El cuidador parecía no tener experiencia.",
            fecha: "2024-01-14",
            reportado: "Calificación sospechosa",
            estado: "Pendiente",
          },
          {
            id: 3,
            cliente: "Luis Martín",
            cuidador: "Sofia Hernández",
            rating: 5,
            comentario: "Excelente servicio, muy profesional y cariñosa con mi madre.",
            fecha: "2024-01-13",
            reportado: "Múltiples calificaciones similares",
            estado: "En revisión",
          },
          {
            id: 4,
            cliente: "Carmen Ruiz",
            cuidador: "Roberto Silva",
            rating: 1,
            comentario: "Servicio terrible, no recomiendo para nada.",
            fecha: "2024-01-12",
            reportado: "Contenido ofensivo",
            estado: "Pendiente",
          },
          {
            id: 5,
            cliente: "Fernando Torres",
            cuidador: "Laura Martínez",
            rating: 2,
            comentario: "La cuidadora no cumplió con los horarios acordados.",
            fecha: "2024-01-11",
            reportado: "Información falsa",
            estado: "En revisión",
          },
          {
            id: 6,
            cliente: "Diego Ramírez",
            cuidador: "Patricia Gómez",
            rating: 1,
            comentario: "Muy mala experiencia, no volvería a contratar.",
            fecha: "2024-01-10",
            reportado: "Spam",
            estado: "Pendiente",
          },
          {
            id: 7,
            cliente: "Mónica Herrera",
            cuidador: "Andrés Morales",
            rating: 5,
            comentario: "Perfecto, excelente trabajo, muy recomendado.",
            fecha: "2024-01-09",
            reportado: "Calificación duplicada",
            estado: "En revisión",
          },
          {
            id: 8,
            cliente: "Ricardo Vega",
            cuidador: "Elena Castro",
            rating: 2,
            comentario: "No estoy conforme con el servicio prestado.",
            fecha: "2024-01-08",
            reportado: "Contenido inapropiado",
            estado: "Pendiente",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRatings = flaggedRatings.filter(
    (rating) =>
      rating.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.cuidador.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = async (ratingId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: "approving" }))
      await apiPut(`/api/calificaciones/${ratingId}`, { status: "approved" })
      toast.success("Calificación aprobada correctamente")
      // Falta update local state
    } catch (error) {
      console.error("Error approving rating:", error)
      toast.error("Error al aprobar la calificación")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: null }))
    }
  }

  const handleDelete = async (ratingId: number) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: "deleting" }))
      await apiPut(`/api/calificaciones/${ratingId}`, { status: "deleted" })
      toast.success("Calificación eliminada correctamente")
      setFlaggedRatings((prev) => prev.filter((rating) => rating.id !== ratingId))
    } catch (error) {
      console.error("Error deleting rating:", error)
      toast.error("Error al eliminar la calificación")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [ratingId]: null }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">CuidaFamilia</span>
                <Badge className="ml-3 bg-red-100 text-red-800">Admin</Badge>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Cargando datos del panel de administración...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">CuidaFamilia</span>
              <Badge className="ml-3 bg-red-100 text-red-800">Admin</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Administrador</p>
                <p className="text-xs text-gray-500">Panel de Control</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona la plataforma y revisa las calificaciones reportadas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cuidadores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cuidadoresActivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.clientesActivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.calificacionesPendientes}</p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Flagged Ratings */}
        <Card className="max-h-[60vh] overflow-hidden ">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Calificaciones Reportadas
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente o cuidador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[60vh] ">
            <div className="space-y-4">
              {filteredRatings.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-lg">{rating.cliente}</h4>
                        <span className="mx-2 text-gray-400">→</span>
                        <h4 className="font-semibold text-lg text-blue-600">{rating.cuidador}</h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({rating.rating}/5)</span>
                        </div>
                        
                      </div>
                      <p className="text-gray-700 mb-2">"{rating.comentario}"</p>
                      <div className="text-sm text-gray-500">
                        <p>
                          <strong>Motivo del reporte:</strong> {rating.reportado}
                        </p>
                        <p>
                          <strong>Fecha:</strong> {rating.fecha}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant={"success"}
                        onClick={() => handleApprove(rating.id)}
                        disabled={loadingStates[rating.id] != null}
                      >
                        {loadingStates[rating.id] === "approving" ? "Aprobando..." : "Aprobar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(rating.id)}
                        disabled={loadingStates[rating.id] != null}
                      >
                        {loadingStates[rating.id] === "deleting" ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRatings.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron calificaciones reportadas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
