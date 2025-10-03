"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CircleUserRound, Star, MessageCircle, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/ui/title";
import { CalificarModal } from "@/components/ui/CalificarModal";
import { StarRating } from "@/components/ui/StarRating";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";

import { apiGet, apiPost } from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

        const params: Record<string, string | number> = {
          aceptado: "true", // string en lugar de boolean
          ordering: "-fecha_inicio",
          ...(tipoUsuario === "cuidador"
            ? { receptor_id: user.id }
            : { cliente_id: user.id }),
        };

        // Historico = aceptados y no-futuros (excluye futura agenda)
        const data = await apiGet<ServicioRead[]>("/servicios", params);

        if (!ac.signal.aborted) setRows(data);
      } catch {
        if (!ac.signal.aborted)
          toast.error("No se pudieron cargar los servicios.");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [user, tipoUsuario, nowISO]);

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
    <div className="space-y-6">
      <PageTitle>Historial de Servicios</PageTitle>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg bg-gray-300" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((s) => {
            const contraparte = getContraparte(s);
            const miCalif = getMiCalificacion(s);
            const perfilHref =
              tipoUsuario === "cuidador"
                ? `/cliente/${contraparte.id}`
                : `/cuidador/${contraparte.id}`;

            return (
              <Card
                key={s.id}
                className="p-6 flex justify-between items-center"
              >
                <div className="flex items-center gap-6">
                  {contraparte.foto_perfil ? (
                  <img src={contraparte.foto_perfil} alt={`Foto de ${nombre(contraparte)}`} className="h-12 w-12 rounded-full mx-auto mb-4 object-cover border-2 border-blue-200" />
                  ) : (
                    <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  )}
                  <div>
                    <p className="text-xl font-semibold">
                      {nombre(contraparte)}
                    </p>
                    <p className="text-l text-gray-500">
                      {s.fecha_inicio.slice(0, 10)} - {s.fecha_fin.slice(0, 10)}
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

                <div className="flex items-center gap-3 text-base w-96 justify-start">
                  <Button 
                    variant="outline" 
                    onClick={() => abrirDetalleModal(s)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Detalles
                  </Button>
                  <Link href={perfilHref}>
                    <Button variant="outline">Ver perfil</Button>
                  </Link>
                  
                  {s.en_curso || s.fecha_inicio > nowISO ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirChat(s)}
                            
                            
                            className="text-blue-600 hover:text-green-600 w-full"
                          >
                            <MessageCircle className="!h-8 !w-8" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Abrir chat</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : miCalif ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-yellow-500 cursor-default">
                            <StarRating 
                              rating={miCalif.puntuacion} 
                              size="lg"
                              className="text-yellow-500"
                            />
                          </div>
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
                      className="text-base px-4 py-2"
                      onClick={() => abrirModal(s.id, nombre(contraparte))}
                      variant="gradient"
                    >
                      Calificar
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
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
