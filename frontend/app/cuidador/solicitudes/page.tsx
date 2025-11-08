"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import PageTitle from "@/components/ui/title";
import { DetalleSolicitudModal } from "@/components/ui/serviceModal";
import { SolicitudCard } from "@/components/ui/SolicitudCard";
import { Button } from "@/components/ui/button";

import { apiGet } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import type { Solicitud, ServicioDTO, PaginatedResponse } from "@/lib/types";
import { mapServiciosToUI } from "@/lib/mappers/servicios";

const PAGE_SIZE = 8;

export default function SolicitudesServicios() {
  const user = useUser();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, hasNext: false, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const ac = new AbortController();

    setLoading(true);

    (async () => {
      try {
        const response = await apiGet<PaginatedResponse<ServicioDTO>>("/servicios", {
          receptor_id: uid,
          aceptado: "false",
          ordering: "-fecha_inicio",
          page_size: PAGE_SIZE,
        });

        if (!ac.signal.aborted) {
          setSolicitudes(mapServiciosToUI(response.results) as unknown as Solicitud[]);
          setPagination({ page: 1, hasNext: Boolean(response.next), total: response.count });
        }
      } catch {
        if (!ac.signal.aborted) {
          toast.error("No se pudieron cargar las solicitudes.");
          setSolicitudes([]);
          setPagination({ page: 1, hasNext: false, total: 0 });
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [user?.id]);

  const loadMore = async () => {
    if (!pagination.hasNext || loadingMore || !user) return;

    const nextPage = pagination.page + 1;
    setLoadingMore(true);
    try {
      const response = await apiGet<PaginatedResponse<ServicioDTO>>("/servicios", {
        receptor_id: user.id,
        aceptado: "false",
        ordering: "-fecha_inicio",
        page: nextPage,
        page_size: PAGE_SIZE,
      });
      setSolicitudes((prev) => [
        ...prev,
        ...(mapServiciosToUI(response.results) as unknown as Solicitud[]),
      ]);
      setPagination({ page: nextPage, hasNext: Boolean(response.next), total: response.count });
    } catch {
      toast.error("No se pudieron cargar más solicitudes.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpdateSolicitudes = (updater: (prev: Solicitud[]) => Solicitud[]) => {
    setSolicitudes((prev) => {
      const next = updater(prev);
      if (next.length !== prev.length) {
        setPagination((state) => ({
          ...state,
          total: Math.max(0, state.total - (prev.length - next.length)),
        }));
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageTitle>Solicitudes de servicio</PageTitle>
      <p className="text-sm text-muted-foreground">
        Mostrando {solicitudes.length} de {pagination.total} solicitudes pendientes
      </p>

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

          {pagination.hasNext && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Cargando..." : "Cargar más"}
              </Button>
            </div>
          )}

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
                actualizarSolicitudes={handleUpdateSolicitudes}
              />
            )
          ))}
        </>
      )}
    </div>
  );
}
