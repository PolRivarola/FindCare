"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  History,
  User,
  MessageCircle,
  Calendar,
  Star,
  MessageCircleQuestion,
  CircleUserRound,
} from "lucide-react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { CalificarModal } from "@/components/ui/CalificarModal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Flag } from "lucide-react";

type UsuarioMini = { id: number; username: string; first_name?: string; last_name?: string; foto_perfil?: string };
type CalificacionMini = { puntuacion: number; comentario?: string | null; creado_en: string } | null;
type ServicioRead = {
  id: number;
  cliente: UsuarioMini;
  receptor: UsuarioMini;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  horas_dia: string;
  aceptado: boolean;
  en_curso: boolean;
  calificacion_cliente: CalificacionMini;
  calificacion_cuidador: CalificacionMini;
  puede_calificar?: boolean;
};

export default function ClienteDashboard() {
  const [activeTab, setActiveTab] = useState("inicio");
  const user = useUser();
  const nowISO = useMemo(() => new Date().toISOString(), []);

  const [needsCarer, setNeedsCarer] = useState(true);
  const [recentServices, setRecentServices] = useState<ServicioRead[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<ServicioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentService, setCurrentService] = useState<ServicioRead | null>(null);

  // Calificar modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccion, setSeleccion] = useState<{ servicioId: number; contraparteNombre: string } | null>(null);

  const nombre = (u: UsuarioMini) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username;

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();
    (async () => {
      try {
        
        const [recientes, proximos, recibidas] = await Promise.all([
          apiGet<ServicioRead[]>("/servicios", {
            cliente_id: user.id,
            aceptado: "true",
            fecha_inicio_before: nowISO,
            ordering: "-fecha_inicio",
          }),
          apiGet<ServicioRead[]>("/servicios", {
            cliente_id: user.id,
            fecha_inicio_after: nowISO,
            ordering: "-fecha_inicio",
            aceptado: "true",

          }),
          apiGet<any[]>("/calificaciones", { receptor_id: user.id }),
        ]);


        if (!ac.signal.aborted) {
          // Filter out active services from recent services
          const serviciosCompletados = recientes.filter((s) => !s.en_curso);
          setRecentServices(serviciosCompletados.slice(0, 5));
          setUpcomingServices(proximos);
          const servicioActivo = recientes.find((s) => s.en_curso);
          setCurrentService(servicioActivo || null);
          setNeedsCarer(!servicioActivo);
          setReviews(recibidas);
        }
      } catch (e) {
        if (!ac.signal.aborted) toast.error("No se pudieron cargar tus servicios");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [user, nowISO]);

  const abrirModal = (servicioId: number, contraparteNombre: string) => {
    setSeleccion({ servicioId, contraparteNombre });
    setModalOpen(true);
  };

  const enviarCalificacion = async (puntuacion: number, comentario: string) => {
    if (!seleccion) return;
    try {
      await apiPost(`/servicios/${seleccion.servicioId}/calificar/`, { puntuacion, comentario });
      toast.success("Calificación enviada");
      // reflect locally
      setRecentServices((prev) =>
        prev.map((s) =>
          s.id !== seleccion.servicioId
            ? s
            : {
                ...s,
                calificacion_cliente: { puntuacion, comentario, creado_en: new Date().toISOString() },
                puede_calificar: false,
              }
        )
      );
    } catch {
      toast.error("No se pudo enviar la calificación");
    } finally {
      setModalOpen(false);
    }
  };

  const toggleReport = async (id: number, current: boolean) => {
    try {
      await apiPost(`/calificaciones/${id}/${current ? 'desreportar' : 'reportar'}/`, {});
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reportada: !current } : r)));
      toast.success(current ? 'Reporte quitado' : 'Calificación reportada');
    } catch {
      toast.error('No se pudo actualizar el reporte');
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 border-2 border-blue-100 bg-blue-50 p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido{user ? `, ${user.username}` : ""}!
          </h1>
          <p className="text-gray-600">
            Gestiona tus servicios de cuidado y encuentra los mejores cuidadores
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Cargando...</h3>
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CircleUserRound className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Verificando servicios</p>
                <Button className="w-full" disabled>Cargando...</Button>
              </CardContent>
            </Card>
          ) : needsCarer ? (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Buscar Cuidadores
                </h3>
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Encuentra el cuidador perfecto
                </p>
                <Link href="/cliente/buscar">
                  <Button className="w-full">Buscar Ahora</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center flex flex-row justify-between">
                <div>
                <h3 className="text-lg font-semibold mb-2">Cuidador actual</h3>
                
                {currentService?.receptor.foto_perfil ? (
                  <img
                    src={currentService.receptor.foto_perfil}
                    alt={`Foto de ${nombre(currentService.receptor)}`}
                    className="h-28 w-28 rounded-full mx-auto mb-4 object-cover border-2 border-blue-200"
                  />
                ) : (
                  <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                )}
                <p className="text-gray-600 mb-4 font-medium">
                  {currentService ? nombre(currentService.receptor) : "Cargando..."}
                </p>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                <Link className="w-full" href="/cliente/chat">
                  <Button className="w-full ">Enviar mensaje</Button>
                </Link>
                <Link className="w-full" href={currentService ? `/cuidador/${currentService.receptor.id}` : "/cliente/buscar"}>
                  <Button className="w-full  ">Ver perfil</Button>
                </Link>
                </div>
                
              </CardContent>
            </Card>
          )}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-center">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Mensajes</h3>
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />

              <p className="text-gray-600 mb-4">
                Comunícate con tus cuidadores
              </p>
              <Link href="/cliente/chat">
                <Button className="w-full  bg-purple-600 text-white hover:bg-white hover:text-purple-600 hover:border-purple-600 hover:border-2">
                  Ver Mensajes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-center">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Necesitas Ayuda?</h3>
              <MessageCircleQuestion className="h-12 w-12 text-green-600 mx-auto mb-4" />

              <p className="text-gray-600 mb-4">Estamos para ayudarte</p>
              <Link href="https://wa.me/543516655333">
                <Button className="w-full  bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 hover:border-2">
                  Contáctanos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Servicios Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentServices.map((service) => {
                  const score = service.calificacion_cliente?.puntuacion ?? 0;
                  const puedeCalificar = Boolean(service.puede_calificar);
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{nombre(service.receptor)}</h4>
                        <p className="text-sm text-gray-500">
                          {service.fecha_inicio.slice(0,10)} - {service.fecha_fin.slice(0,10)}
                        </p>
                      </div>
                      <div className="text-right">
                        {score > 0 ? (
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < score ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        ) : puedeCalificar ? (
                          <Button size="sm" onClick={() => abrirModal(service.id, nombre(service.receptor))}>
                            Calificar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link href="/cliente/historial">
                  <Button variant="outline" className="w-full">
                    Ver Todo el Historial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Scroll container with fixed height; header remains visible */}
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {upcomingServices.map((service) => {
                  const d = new Date(service.fecha_inicio);
                  const fecha = d.toLocaleDateString();
                  const hora = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <div>
                        <h4 className="font-medium">{nombre(service.receptor)}</h4>
                        <p className="text-sm text-blue-600 font-medium">
                          {fecha} a las {hora}
                        </p>
                      </div>
                      <div>
                        <Link href="/cliente/chat"><Button size="sm">Contactar</Button></Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calificaciones que recibí */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Mis Calificaciones
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
      </main>
      <CalificarModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cuidadorId={
          seleccion
            ? recentServices.find((s) => s.id === seleccion.servicioId)?.receptor.id || 0
            : 0
        }
        cuidadorNombre={seleccion?.contraparteNombre || ""}
        onSubmit={enviarCalificacion}
      />
    </>
  );
}
