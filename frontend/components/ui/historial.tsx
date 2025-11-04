"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CircleUserRound, Star, MessageCircle, FileText, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils/dateFormat";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/ui/title";
import { CalificarModal } from "@/components/ui/CalificarModal";
import { StarRating } from "@/components/ui/StarRating";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";

import { apiGet, apiPost } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** ====== Tipos que devuelve el backend (ServicioReadSerializer) ====== */
type UsuarioMini = {
  foto_perfil: string | undefined;
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  ciudad?: string;
  provincia?: string;
};
type CalificacionMini = {
  puntuacion: number;
  comentario?: string | null;
  creado_en: string;
} | null;

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
  calificacion_cliente: CalificacionMini; // hecha por el cliente
  calificacion_cuidador: CalificacionMini; // hecha por el cuidador
  puede_calificar: boolean; // para el usuario actual
};

type Props = { tipoUsuario: "cliente" | "cuidador" };

export function HistorialServicios({ tipoUsuario }: Props) {
  const user = useUser();
  const [rows, setRows] = useState<ServicioRead[]>([]);
  const [pendingRows, setPendingRows] = useState<ServicioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [pagination, setPagination] = useState({ page: 1, hasNext: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const paramsRef = useRef<Record<string, string | number>>({});

  // modal de calificación
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccion, setSeleccion] = useState<{
    servicioId: number;
    contraparteNombre: string;
  } | null>(null);

  // modal de detalles
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioRead | null>(null);

  const nowISO = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();

    (async () => {
      try {
        const base =
          tipoUsuario === "cuidador"
            ? { receptor_id: user.id }
            : { cliente_id: user.id };

        // Fetch accepted services (existing logic)
        const acceptedParams: Record<string, string | number> = {
          aceptado: "true", // string en lugar de boolean
        const params: Record<string, string | number> = {
          aceptado: "true",
          ordering: "-fecha_inicio",
          ...(tipoUsuario === "cuidador"
            ? { receptor_id: user.id }
            : { cliente_id: user.id }),
        };

        const acceptedData = await apiGet<ServicioRead[]>("/servicios", acceptedParams);

        if (!ac.signal.aborted) setRows(acceptedData);

        // For cliente users, also fetch pending services
        if (tipoUsuario === "cliente") {
          const pendingParams: Record<string, string | number> = {
            aceptado: "false", // pending services
            ordering: "-fecha_inicio",
            cliente_id: user.id,
          };

          const pendingData = await apiGet<ServicioRead[]>("/servicios", pendingParams);

          if (!ac.signal.aborted) setPendingRows(pendingData);
        paramsRef.current = params;

        const data = await apiGet<PaginatedResponse<ServicioRead>>("/servicios", params);

        if (!ac.signal.aborted) {
          setRows(data.results);
          setPagination({ page: 1, hasNext: Boolean(data.next) });
        }
      } catch {
        if (!ac.signal.aborted)
          toast.error("No se pudieron cargar los servicios.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [user, tipoUsuario, nowISO]);

  const loadMore = async () => {
    const nextPage = pagination.page + 1;
    setLoadingMore(true);
    try {
      const response = await apiGet<PaginatedResponse<ServicioRead>>("/servicios", {
        ...paramsRef.current,
        page: nextPage,
      });
      setRows((prev) => [...prev, ...response.results]);
      setPagination({ page: nextPage, hasNext: Boolean(response.next) });
    } catch {
      toast.error("No se pudieron cargar más servicios.");
    } finally {
      setLoadingMore(false);
    }
  };

  // helpers UI
  const nombre = (u: UsuarioMini) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.username;

  const getMiCalificacion = (s: ServicioRead) => {
    // cuál calificación mostrar como "mía" depende del rol del viewer
    return tipoUsuario === "cliente"
      ? s.calificacion_cliente
      : s.calificacion_cuidador;
  };

  const getContraparte = (s: ServicioRead) =>
    tipoUsuario === "cuidador" ? s.cliente : s.receptor;
  const abrirChat = async (s: ServicioRead) => {
    const contraparte = getContraparte(s);
    try {
      const res = await fetch("/api/b/conversaciones/ensure/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: contraparte.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const convId = data.id;
      const chatPath = tipoUsuario === "cliente" ? "/cliente/chat" : "/cuidador/chat";
      router.push(`${chatPath}?c=${convId}`);
    } catch {
      toast.error("No se pudo abrir el chat");
    }
  };

  const abrirModal = (servicioId: number, contraparteNombre: string) => {
    setSeleccion({ servicioId, contraparteNombre });
    setModalOpen(true);
  };

  const abrirDetalleModal = (servicio: ServicioRead) => {
    setServicioSeleccionado(servicio);
    setDetalleModalOpen(true);
  };

  // Convertir ServicioRead a Solicitud para el modal
  const convertirASolicitud = (servicio: ServicioRead): any => {
    const contraparte = getContraparte(servicio);
    return {
      id: servicio.id,
      id_cliente: servicio.cliente.id,
      id_cuidador: servicio.receptor.id,
      foto: contraparte.foto_perfil || "/placeholder-user.jpg",
      cliente: `${contraparte.first_name || ''} ${contraparte.last_name || ''}`.trim() || contraparte.username,
      cliente_ciudad: servicio.cliente.ciudad || "—",
      cliente_provincia: servicio.cliente.provincia || "—",
      servicio: [servicio.descripcion],
      fecha_inicio: servicio.fecha_inicio.slice(0, 10),
      fecha_fin: servicio.fecha_fin.slice(0, 10),
      hora: servicio.horas_dia,
      rangos_horarios: [],
      aceptado: servicio.aceptado
    };
  };

  const enviarCalificacion = async (puntuacion: number, comentario: string) => {
    if (!seleccion) return;
    try {
      await apiPost(`/servicios/${seleccion.servicioId}/calificar/`, {
        puntuacion,
        comentario,
      });
      toast.success("Calificación enviada");

      // Refrescar localmente la fila calificada
      setRows((prev) =>
        prev.map((r) =>
          r.id !== seleccion.servicioId
            ? r
            : {
                ...r,
                // el backend ya decide quién es el autor; reflejamos en el campo correcto
                ...(tipoUsuario === "cliente"
                  ? {
                      calificacion_cliente: {
                        puntuacion,
                        comentario,
                        creado_en: new Date().toISOString(),
                      },
                      puede_calificar: false,
                    }
                  : {
                      calificacion_cuidador: {
                        puntuacion,
                        comentario,
                        creado_en: new Date().toISOString(),
                      },
                      puede_calificar: false,
                    }),
              }
        )
      );
    } catch {
      toast.error("No se pudo enviar la calificación");
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-0">
      <PageTitle>Historial de Servicios</PageTitle>

      {loading ? (
        <div className="space-y-3 md:space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 md:h-28 w-full rounded-lg bg-gray-300" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {/* Combine accepted and pending services, sort by date */}
          {[...rows, ...pendingRows]
            .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
            .map((s) => {
            const contraparte = getContraparte(s);
            const miCalif = getMiCalificacion(s);
            const perfilHref =
              tipoUsuario === "cuidador"
                ? `/cliente/${contraparte.id}`
                : `/cuidador/${contraparte.id}`;

            return (
              <Card
                key={s.id}
                className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                  {contraparte.foto_perfil ? (
                  <img src={contraparte.foto_perfil} alt={`Foto de ${nombre(contraparte)}`} className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border-2 border-blue-200 flex-shrink-0" />
                  ) : (
                    <CircleUserRound className="h-12 w-12 md:h-16 md:w-16 text-blue-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-xl font-semibold truncate">
                      {nombre(contraparte)}
                    </p>
                    <p className="text-sm md:text-base text-gray-500 mt-1">
                      {formatDate(s.fecha_inicio.slice(0, 10))} - {formatDate(s.fecha_fin.slice(0, 10))}
                      {!s.aceptado && tipoUsuario === "cliente" && (
                        <Badge className="ml-2 px-2 py-0.5 text-xs align-middle bg-yellow-100 text-yellow-700">
                          PENDIENTE
                        </Badge>
                      )}
                      {s.en_curso && (
                        <Badge className="ml-2 px-2 py-0.5 text-xs align-middle bg-green-100 text-green-700">
                          EN CURSO
                        </Badge>
                      )}
                      {s.fecha_inicio > nowISO && (
                        <Badge className="ml-2 px-2 py-0.5 text-xs align-middle bg-blue-100 text-blue-700">
                          FUTURO
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base w-[240px] justify-start flex-wrap">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => abrirDetalleModal(s)}
                          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 h-9 min-w-[80px] justify-center hover:text-purple-600 hover:border-purple-600"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Detalles</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Link href={perfilHref}>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 h-9 min-w-[80px] justify-center hover:text-purple-600 hover:border-purple-600"
                          >
                            <User className="h-4 w-4 " />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver perfil</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Link>
                  
                  {!s.aceptado && tipoUsuario === "cliente" ? (
                    // For pending services, only show details and profile buttons
                    <div className="h-9 min-w-[80px] flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-400 text-xs">Esperando respuesta</span>
                    </div>
                  ) : s.en_curso || s.fecha_inicio > nowISO ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirChat(s)}
                            className="flex items-center gap-1 md:gap-2 text-purple-600 hover:text-green-600 h-9 px-2 md:px-4 border-purple-200 hover:border-green-300 min-w-[80px] justify-center"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden xs:inline">Chat</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Abrir chat</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : miCalif ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex items-center justify-center text-yellow-500 cursor-default h-9 px-2 md:px-4 border border-gray-200 rounded-md bg-gray-50 min-w-[80px]">
                            <StarRating 
                              rating={miCalif.puntuacion} 
                              size="md"
                              className="text-yellow-500"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {miCalif.comentario?.trim()
                              ? miCalif.comentario
                              : "Sin comentario"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : s.puede_calificar ? (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => abrirModal(s.id, nombre(contraparte))}
                      className="text-xs md:text-sm px-2 md:px-4 h-9 min-w-[80px] justify-center"
                    >
                      Calificar
                    </Button>
                  ) : (
                    <div className="h-9 min-w-[80px] flex items-center justify-center">
                      <span className="text-gray-400 text-xs">—</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {pagination.hasNext && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Cargando..." : "Ver más"}
              </Button>
            </div>
          )}
        </div>
      )}

      {seleccion && (
        <CalificarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          cuidadorId={
            getContraparte(rows.find((r) => r.id === seleccion.servicioId)!).id
          } // mantiene tu API del modal
          cuidadorNombre={seleccion.contraparteNombre}
          onSubmit={enviarCalificacion}
        />
      )}

      {servicioSeleccionado && (
        <DetalleSolicitudModal
          solicitud={convertirASolicitud(servicioSeleccionado)}
          open={detalleModalOpen}
          onOpenChange={setDetalleModalOpen}
          actualizarSolicitudes={() => {}} // No necesitamos actualizar en historial
          showActions={false} // Hide action buttons in historial
        />
      )}
    </div>
  );
}
