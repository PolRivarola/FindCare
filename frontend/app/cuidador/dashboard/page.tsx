"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Solicitud } from "@/lib/types";

import {
  Heart,
  Bell,
  History,
  User,
  MessageCircle,
  Calendar,
  DollarSign,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";


export default function CuidadorDashboard() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<Solicitud[]>("/cuidador/solicitudes")
      .then((data) => setSolicitudes(data))
      .catch(() => {
        toast.error("No se pudieron cargar las solicitudes");
        setSolicitudes([
    {
      id: 1,
      id_cliente: 1,
      id_cuidador: 1,
      foto: "/placeholder.jpg",
      cliente: "Mario Perez",
      servicio: ["Edad avanzada, Discapacidad motriz"],
      fecha_inicio: "2024-01-22",
      fecha_fin: "2024-01-22",
      hora: "Todo el día",
      ubicacion: "Centro, Montevideo",
      rangos_horarios: [
        "08:00 - 12:00" ,
        "05:00 - 6:00",
      ],
    },
    {
      id: 2,
      id_cliente: 1,
      id_cuidador: 1,
      foto: "/placeholder.jpg",
      cliente: "María López",
      servicio: ["Discapacidad intelectual"],
      fecha_inicio: "2024-01-22",
      fecha_fin: "2024-01-22",
      hora: "Todo el día",
      ubicacion: "Centro, Montevideo",
      rangos_horarios: [
        "08:00 - 12:00" ,
        "05:00 - 6:00",
      ],
    },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    serviciosCompletados: 45,
    calificacionPromedio: 4.8,
    ingresosMes: "$12,500",
    solicitudesPendientes: solicitudes.length,
  };

  const aceptarSolicitud = (id: number) => {
    apiPost(`/cuidador/solicitudes/${id}/aceptar`, {})
      .then(() => {
        toast.success("Solicitud aceptada");
        setSolicitudes((prev) => prev.filter((s) => s.id !== id));
        setModalOpenId(null);
      })
      .catch(() => toast.error("Error al aceptar solicitud"));
  };

  const rechazarSolicitud = (id: number) => {
    apiDelete(`/cuidador/solicitudes/${id}`)
      .then(() => {
        toast.success("Solicitud rechazada");
        setSolicitudes((prev) => prev.filter((s) => s.id !== id));
        setModalOpenId(null);
      })
      .catch(() => toast.error("Error al rechazar solicitud"));
  };

  return (
    <div className="flex-1">
      <main className="p-6 ">
        <div className="mb-8 border-2 border-blue-100 bg-blue-50 p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenida, Ana!
          </h1>
          <p className="text-gray-600">
            Gestiona tus servicios y solicitudes de cuidado
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8 ">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Servicios Completados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.serviciosCompletados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Calificación
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.calificacionPromedio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Solicitudes Pendientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.solicitudesPendientes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Solicitudes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {solicitudes.map((req) => (
                    <div
                      key={req.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {req.cliente}
                          </h4>
                          <p className="text-gray-600 mb-2">{req.servicio}</p>
                          <div className="grid grid-cols-2  gap-1 text-sm text-gray-600 max-w-md">
                            <div>
                              <p className="mb-2">
                                <strong>Fecha de inicio:</strong> {req.fecha_inicio}
                              </p>
                              <p>
                                <strong>Horario:</strong> {req.hora}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Ubicación:</strong> {req.ubicacion}
                              </p>
                            </div>
                          </div>
                        </div>
                        <DetalleSolicitudModal
                          solicitud={req}
                          open={modalOpenId === req.id}
                          onOpenChange={(open) =>
                            setModalOpenId(open ? req.id : null)
                          }
                          actualizarSolicitudes={setSolicitudes} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/cuidador/solicitudes">
                    <Button variant="outline" className="w-full">
                      Ver Todas las Solicitudes
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <History className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Historial de Servicios
              </h3>
              <p className="text-gray-600 mb-4">
                Revisa tus servicios completados
              </p>
              <Link href="/cuidador/historial">
                <Button variant="outline" className="w-full">
                  Ver Historial
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Actualizar Perfil</h3>
              <p className="text-gray-600 mb-4">
                Mantén tu información actualizada
              </p>
              <Link href="/cuidador/perfil">
                <Button variant="outline" className="w-full">
                  Editar Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
