"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import PageTitle from "@/components/ui/title";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";
import { SolicitudCard } from "@/components/ui/SolicitudCard";

import { apiGet } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import type { Solicitud, ServicioDTO } from "@/lib/types";
import { mapServiciosToUI } from "@/lib/mappers/servicios";

type Props = { tipoUsuario: "cliente" | "cuidador" };

export default function SolicitudesServicios({ tipoUsuario }: Props) {
  const user = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const ac = new AbortController();

    (async () => {
      try {
        // Armamos los filtros según el tipo de usuario
        

        const rows = await apiGet<ServicioDTO[]>("/servicios", { receptor_id: uid, aceptado: "false", ordering: "-fecha_inicio" });
        if (!ac.signal.aborted) {
          setSolicitudes(mapServiciosToUI(rows) as unknown as Solicitud[]);
        }
      } catch {
        if (!ac.signal.aborted) {
          toast.error("No se pudieron cargar las solicitudes.");
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [user?.id, tipoUsuario]);

  return (
    <div className="space-y-6">
      <PageTitle>Solicitudes de servicio</PageTitle>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg bg-gray-300" />
          ))}
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-6 mb-4">
            <Inbox className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes solicitudes pendientes
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Cuando los clientes soliciten tus servicios, aparecerán aquí para que puedas revisarlas y aceptarlas.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {solicitudes.map((servicio) => (
              <SolicitudCard
                key={servicio.id}
                solicitud={servicio}
                onVerDetalles={setModalOpenId}
              />
            ))}
          </div>

          {/* Render modals outside the map */}
          {solicitudes.map((servicio) => (
            modalOpenId === servicio.id && (
              <DetalleSolicitudModal
                key={servicio.id}
                solicitud={servicio}
                open={true}
                onOpenChange={(open) =>
                  setModalOpenId(open ? servicio.id : null)
                }
                actualizarSolicitudes={setSolicitudes}
              />
            )
          ))}
        </>
      )}
    </div>
  );
}
