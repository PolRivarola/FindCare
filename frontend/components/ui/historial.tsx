"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CircleUserRound, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/ui/title";
import { CalificarModal } from "@/components/ui/CalificarModal";

import { apiGet, apiPost } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** ====== Tipos que devuelve el backend (ServicioReadSerializer) ====== */
type UsuarioMini = { id: number; username: string; first_name?: string; last_name?: string };
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
  calificacion_cliente: CalificacionMini;   // hecha por el cliente
  calificacion_cuidador: CalificacionMini;  // hecha por el cuidador
  puede_calificar: boolean;                 // para el usuario actual
};

type Props = { tipoUsuario: "cliente" | "cuidador" };

export function HistorialServicios({ tipoUsuario }: Props) {
  const user = useUser();
  const [rows, setRows] = useState<ServicioRead[]>([]);
  const [loading, setLoading] = useState(true);

  // modal de calificación
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccion, setSeleccion] = useState<{ servicioId: number; contraparteNombre: string } | null>(null);

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
  fecha_inicio_before: nowISO,
  ordering: "-fecha_inicio",
  ...(tipoUsuario === "cuidador"
    ? { receptor_id: user.id }
    : { cliente_id: user.id }),
};

        // Historico = aceptados y no-futuros (excluye futura agenda)
        const data = await apiGet<ServicioRead[]>("/servicios", params);


        if (!ac.signal.aborted) setRows(data);
      } catch {
        if (!ac.signal.aborted) toast.error("No se pudieron cargar los servicios.");
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
    return tipoUsuario === "cliente" ? s.calificacion_cliente : s.calificacion_cuidador;
  };

  const getContraparte = (s: ServicioRead) => (tipoUsuario === "cuidador" ? s.cliente : s.receptor);

  const abrirModal = (servicioId: number, contraparteNombre: string) => {
    setSeleccion({ servicioId, contraparteNombre });
    setModalOpen(true);
  };

  const enviarCalificacion = async (puntuacion: number, comentario: string) => {
    if (!seleccion) return;
    try {
      await apiPost(`/servicios/${seleccion.servicioId}/calificar/`, { puntuacion, comentario });
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
                  ? { calificacion_cliente: { puntuacion, comentario, creado_en: new Date().toISOString() }, puede_calificar: false }
                  : { calificacion_cuidador: { puntuacion, comentario, creado_en: new Date().toISOString() }, puede_calificar: false }),
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
              tipoUsuario === "cuidador" ? `/cliente/${contraparte.id}` : `/cuidador/${contraparte.id}`;

            return (
              <Card key={s.id} className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-xl font-semibold">{nombre(contraparte)}</p>
                    <p className="text-l text-gray-500">
                      {s.fecha_inicio.slice(0, 10)} - {s.fecha_fin.slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-base">
                  <Link href={perfilHref}>
                    <Button variant="secondary">Ver perfil</Button>
                  </Link>

                  {s.en_curso ? (
                    <Badge className="text-base px-3 py-1 bg-green-100 text-green-700">EN CURSO</Badge>
                  ) : miCalif ? (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center text-yellow-500 cursor-default">
          {Array(miCalif.puntuacion)
            .fill(0)
            .map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-yellow-500 stroke-yellow-500" />
            ))}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">
          {miCalif.comentario?.trim() ? miCalif.comentario : "Sin comentario"}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
) : s.puede_calificar ? (
                    <Button
                      className="text-base px-4 py-2"
                      onClick={() => abrirModal(s.id, nombre(contraparte))}
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
          cuidadorId={getContraparte(rows.find((r) => r.id === seleccion.servicioId)!).id} // mantiene tu API del modal
          cuidadorNombre={seleccion.contraparteNombre}
          onSubmit={enviarCalificacion}
        />
      )}
    </div>
  );
}
