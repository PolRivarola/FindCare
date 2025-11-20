"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServicioDTO, Solicitud, PaginatedResponse } from "@/lib/types";

import { Heart, Bell, History, User, MessageCircle, Calendar, DollarSign, Star, FileText, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useCreateChat } from "@/hooks/useCreateChat";
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
import { SolicitudCard } from "@/components/ui/SolicitudCard";
import { PaginationControls } from "@/components/PaginationControls";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const REVIEWS_PAGE_SIZE = 3;

type UsuarioMini = { 
  id: number; 
  username: string; 
  first_name?: string; 
  last_name?: string; 
  foto_perfil?: string;
  ciudad?: string;
  provincia?: string;
};
type ServicioActivo = {
  id: number;
  cliente: UsuarioMini;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  horas_dia: string;
  dias_semanales: Array<{ id: number; nombre: string }>;
  en_curso: boolean;
};

export default function CuidadorDashboard() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);
  const [serviceModalOpenId, setServiceModalOpenId] = useState<number | null>(null);
  const user = useUser();
  const { crearChat } = useCreateChat("cuidador");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ongoingServices, setOngoingServices] = useState<ServicioActivo[]>([]);
  const [stats, setStats] = useState({
  serviciosCompletados: 0,
  calificacionPromedio: 0,
  solicitudesPendientes: 0,
});


useEffect(() => {
  if (!user) return;   
  const uid = user.id;              
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
      
      const data = await apiGet<PaginatedResponse<ServicioDTO>>("/servicios/", {
        receptor_id: uid,           
        aceptado: "false",          
        ordering: "-id",
        page_size: 6,
      });

      if (!ac.signal.aborted)
        setSolicitudes(mapServiciosToUI(data.results) as unknown as Solicitud[]);

      // Fetch ongoing services (accepted, started before today, ending after today)
      const now = new Date().toISOString();
      const ongoingData = await apiGet<PaginatedResponse<any>>("/servicios/", {
        receptor_id: uid,
        aceptado: "true",
        fecha_inicio_before: now,
        fecha_fin_after: now,
        ordering: "-fecha_inicio",
        page_size: 10,
      });

      if (!ac.signal.aborted) {
        setOngoingServices(ongoingData.results || []);
      }

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


useEffect(() => {
  if (!user) return;
  let cancelled = false;

  (async () => {
    setReviewsLoading(true);
    try {
      const response = await apiGet<PaginatedResponse<any>>("/calificaciones", {
        receptor_id: user.id,
        page: reviewsPage,
        page_size: REVIEWS_PAGE_SIZE,
      });
      if (cancelled) return;
      const results = response.results || [];
      const total = response.count ?? results.length ?? 0;
      const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
      if (totalPages > 0 && reviewsPage > totalPages) {
        setReviewsPage(totalPages);
        return;
      }
      setReviews(results);
      setReviewsTotal(total);
      setReviewsTotalPages(totalPages);
    } catch {
      if (!cancelled) {
        toast.error("No se pudieron cargar las calificaciones");
        setReviews([]);
        setReviewsTotal(0);
        setReviewsTotalPages(0);
      }
    } finally {
      if (!cancelled) {
        setReviewsLoading(false);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, [user, reviewsPage]);

useEffect(() => {
  setReviewsPage(1);
}, [user?.id]);

const handleReviewPageChange = (page: number) => {
  if (reviewsTotalPages === 0) return;
  const clamped = Math.max(1, Math.min(page, reviewsTotalPages));
  if (clamped !== reviewsPage) {
    setReviewsPage(clamped);
  }
};

useEffect(() => {
  if (reviewsTotalPages === 0 && reviewsPage !== 1) {
    setReviewsPage(1);
  }
}, [reviewsTotalPages]);

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

  const nombre = (u: UsuarioMini) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username;

  // Convert ServicioActivo to Solicitud format for the modal
  const mapServicioToSolicitud = (service: ServicioActivo): Solicitud => {
    return {
      id: service.id,
      id_cliente: service.cliente.id,
      cliente: nombre(service.cliente),
      cliente_ciudad: service.cliente.ciudad || "",
      cliente_provincia: service.cliente.provincia || "",
      servicio: [service.descripcion],
      fecha_inicio: service.fecha_inicio,
      fecha_fin: service.fecha_fin,
      hora: service.horas_dia || "",
      rangos_horarios: [],
      dias_semanales: service.dias_semanales?.map(d => d.nombre) || [],
      foto: service.cliente.foto_perfil || "",
    };
  };

  // Show loading skeleton on initial load
  if (loading && solicitudes.length === 0 && stats.serviciosCompletados === 0) {
    return (
      <div className="flex-1">
        <main className="p-6">
          <div className="mb-8 border-2 bg-gradient-to-tr from-purple-600 to-blue-600 p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-8 w-64 bg-white/20 rounded mb-2"></div>
            <div className="h-4 w-96 bg-white/20 rounded"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mb-8 animate-pulse">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-28 bg-gray-200 rounded"></div>
                <div className="h-28 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <main className="p-6 ">
      <div className="mb-8 border-2 bg-gradient-to-tr from-purple-600 to-blue-600 p-6 rounded-lg shadow-sm">
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
                <div className="p-2 ">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto " />
                </div>
                <div className="ml-4">
                  <p className="text-md font-medium text-gray-600">
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
                <div className="p-2 ">
                  <Star className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <div className="ml-4">
                  <p className="text-md font-medium text-gray-600">
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
                <div className="p-2 ">
                  <Bell className="h-12 w-12 text-purple-600 mx-auto " />
                </div>
                <div className="ml-4">
                  <p className="text-md font-medium text-gray-600">
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
                    <SolicitudCard
                      key={req.id}
                      solicitud={req}
                      onVerDetalles={setModalOpenId}
                    />
                  ))}
                </div>

                {/* Render modals outside the map */}
                {solicitudes.map((req) => (
                  modalOpenId === req.id && (
                    <DetalleSolicitudModal
                      key={req.id}
                      solicitud={req}
                      open={true}
                      onOpenChange={(open) =>
                        setModalOpenId(open ? req.id : null)
                      }
                      actualizarSolicitudes={setSolicitudes} 
                    />
                  )
                ))}

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

          {ongoingServices.length > 0 ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {ongoingServices.length === 1 ? (
                  // Single service - no carousel needed
                  <>
                  <h3 className="text-lg font-semibold mb-2 text-center">Client{ongoingServices.length > 1 ? "es" : "e"} Actual{ongoingServices.length > 1 ? "es" : ""} </h3>
                  <div className="text-center flex flex-row justify-around h-full  items-center gap-4">
                    <div>
                    
                    {ongoingServices[0].cliente.foto_perfil ? (
                      <img
                        src={ongoingServices[0].cliente.foto_perfil}
                        alt={`Foto de ${nombre(ongoingServices[0].cliente)}`}
                        className="h-36 w-36 rounded-full mx-auto mb-4 object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <CircleUserRound className="h-36 w-36 text-blue-600 mx-auto mb-4" />
                    )}
                    
                    <p className="text-gray-600 mb-4 font-medium">
                      {nombre(ongoingServices[0].cliente)}
                    </p>
                    </div>
                    
                    
                    <div className="flex flex-col gap-2 justify-center">
                      <Button 
                        className="w-full" 
                        variant="gradient"
                        onClick={() => setServiceModalOpenId(ongoingServices[0].id)}
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="gradient"
                        onClick={() => crearChat(ongoingServices[0].cliente.id)}
                      >
                        Enviar mensaje
                      </Button>
                      <Link className="w-full" href={`/cliente/${ongoingServices[0].cliente.id}`}>
                        <Button className="w-full" variant="gradient">Ver perfil</Button>
                      </Link>
                    </div>
                  </div>
                  </>
                ) : (
                  // Multiple services - use carousel
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Clientes Actuales</h3>
                    <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        {ongoingServices.map((service) => (
                          <CarouselItem key={service.id}>
                            <div className="flex flex-col items-center">
                              {service.cliente.foto_perfil ? (
                                <img
                                  src={service.cliente.foto_perfil}
                                  alt={`Foto de ${nombre(service.cliente)}`}
                                  className="h-28 w-28 rounded-full mb-4 object-cover border-2 border-blue-200"
                                />
                              ) : (
                                <CircleUserRound className="h-28 w-28 text-blue-600 mb-4" />
                              )}
                              
                              <p className="text-gray-600 mb-4 font-medium">
                                {nombre(service.cliente)}
                              </p>
                              
                              <div className="flex flex-col gap-2 w-full">
                                <Button 
                                  className="w-full" 
                                  variant="gradient"
                                  onClick={() => setServiceModalOpenId(service.id)}
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  className="w-full" 
                                  variant="gradient"
                                  onClick={() => crearChat(service.cliente.id)}
                                >
                                  Enviar mensaje
                                </Button>
                                <Link className="w-full" href={`/cliente/${service.cliente.id}`}>
                                  <Button className="w-full" variant="gradient">Ver perfil</Button>
                                </Link>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                    <p className="text-sm text-gray-500 mt-4">
                      {ongoingServices.length} servicios activos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
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
          )}
        </div>

        {/* Service Detail Modals for ongoing services */}
        {ongoingServices.map((service) => (
          serviceModalOpenId === service.id && (
            <DetalleSolicitudModal
              key={service.id}
              solicitud={mapServicioToSolicitud(service)}
              open={true}
              onOpenChange={(open) => setServiceModalOpenId(open ? service.id : null)}
              actualizarSolicitudes={() => {}} // No-op since we don't need to update the list
              showActions={false}
            />
          )
        ))}
      </main>
      {/* Calificaciones recibidas */}
      <div className="p-6">
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Calificaciones Recibidas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mostrando {reviews.length} de {reviewsTotal} reseñas
            </p>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="text-center text-sm text-muted-foreground">
                Cargando calificaciones...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-gray-600">Aún no recibiste calificaciones.</div>
            ) : (
              <>
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
                {reviewsTotalPages > 1 && (
                  <PaginationControls
                    page={reviewsPage}
                    totalPages={reviewsTotalPages}
                    count={reviewsTotal}
                    pageSize={REVIEWS_PAGE_SIZE}
                    onPageChange={handleReviewPageChange}
                    disabled={reviewsLoading}
                    className="mt-4"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
