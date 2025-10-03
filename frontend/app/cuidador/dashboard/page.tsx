"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServicioDTO, Solicitud } from "@/lib/types";

import { Heart, Bell, History, User, MessageCircle, Calendar, DollarSign, Star } from "lucide-react";
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
import { ReviewCard } from "@/components/ui/ReviewCard";
import { useUser } from "@/context/UserContext";
import { mapServiciosToUI } from "@/lib/mappers/servicios";


export default function CuidadorDashboard() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);
  const user = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
  serviciosCompletados: 0,
  calificacionPromedio: 0,
  solicitudesPendientes: 0,
});


useEffect(() => {
  console.log("Cargando solicitudes para el cuidador...");
  if (!user) return;   
  console.log(user)             
  const uid = user.id;              
  console.log(uid)
  const ac = new AbortController();
  (async function load() {

    
    try {

      const s = await apiGet<{ pendientes: number; completados: number; calificacion_promedio: number }>(
        "/servicios/stats/cuidador/",
        { receptor_id: user.id }
      );
      if (!ac.signal.aborted) {
        setStats({
          serviciosCompletados: s.completados,
          calificacionPromedio: s.calificacion_promedio,
          solicitudesPendientes: s.pendientes,
        });
      }
      
      const data = await apiGet<ServicioDTO[]>("/servicios/", {
        receptor_id: uid,           
        aceptado: "false",          
        ordering: "-fecha_inicio",
      });
      console.log("Solicitudes cargadas:", data);

      if (!ac.signal.aborted) setSolicitudes(mapServiciosToUI(data) as unknown as Solicitud[]);

      // cargar calificaciones recibidas por el cuidador
      const califs = await apiGet<any[]>("/calificaciones", { receptor_id: uid });
      if (!ac.signal.aborted) setReviews(califs);
    } catch {
      if (!ac.signal.aborted) {
        toast.error("Error al cargar datos");
      }
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  })();

  return () => ac.abort();
}, [user]);                      


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

  const toggleReport = async (id: number, current: boolean, reason?: string) => {
    try {
      const payload = current ? {} : { motivo: reason || "" };
      await apiPost(`/calificaciones/${id}/${current ? 'desreportar' : 'reportar'}/`, payload);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reportada: !current } : r)));
      toast.success(current ? 'Reporte quitado' : 'Calificación reportada');
    } catch {
      toast.error('No se pudo actualizar el reporte');
    }
  };

  return (
    <div className="flex-1">
      <main className="p-6 ">
      <div className="mb-8 border-2  bg-blue-600 p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Hola{user ? `, ${user.first_name || user.username}` : ""}!
          </h1>
          <p className="text-white">
            Gestiona tus servicios de cuidado y encuentra los mejores cuidadores
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8 ">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
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
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Calificación
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.calificacionPromedio === 0? "N/A"
                    :
                    stats.calificacionPromedio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Bell className="h-6 w-6 text-white" />
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
              solicitudes.length > 0 ? (
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
                          <p className="text-gray-600 mb-2 w-1/2">{req.servicio}</p>
                      
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
            ) : (
              <div className="text-center text-gray-600 text-lg font-semibold my-3">
                No hay solicitudes pendientes
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <History className="h-12 w-12 text-purple-600 mx-auto mb-4" />
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
      {/* Calificaciones recibidas */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Calificaciones Recibidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-gray-600">Aún no recibiste calificaciones.</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    id={r.id}
                    rating={r.puntuacion}
                    comment={r.comentario}
                    date={r.creado_en}
                    showReportButton={true}
                    isReported={r.reportada}
                    onReport={toggleReport}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
