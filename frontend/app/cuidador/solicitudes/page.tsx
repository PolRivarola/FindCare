"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import PageTitle from "@/components/ui/title";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";

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
      ) : (
        <div className="space-y-4">
          {solicitudes.map((servicio) => {
            // Para el botón "Ver perfil" mostramos el perfil del contraparte
            const perfilHref =
              `/cliente/${servicio.id_cliente}`;

            return (
              <Card
                key={servicio.id}
                className="p-6 flex justify-between items-center"
              >
                <div className="flex items-center gap-6">
                  <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto" />
                  <div>
                    <p className="text-xl font-semibold">{servicio.cliente}</p>
                    <p className="text-l text-gray-500">{servicio.servicio}</p>
                    <p className="text-l text-gray-500">
                      {servicio.fecha_inicio} - {servicio.fecha_fin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-base">
                  <Link href={perfilHref}>
                    <Button variant="secondary">Ver perfil</Button>
                  </Link>

                  <DetalleSolicitudModal
                    solicitud={servicio}
                    open={modalOpenId === servicio.id}
                    onOpenChange={(open) =>
                      setModalOpenId(open ? servicio.id : null)
                    }
                    actualizarSolicitudes={setSolicitudes}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
