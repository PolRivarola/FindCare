import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { apiDelete, apiPost, apiGet } from "@/lib/api";
import { Solicitud } from "@/lib/types";

type Props = {
  solicitud: Solicitud;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actualizarSolicitudes: (updater: (prev: Solicitud[]) => Solicitud[]) => void;
};

export function DetalleSolicitudModal({
  solicitud,
  open,
  onOpenChange,
  actualizarSolicitudes,
}: Props) {
  const [loading, setLoading] = useState(false);

  const aceptarSolicitud = async () => {
    setLoading(true);
    try {
      await apiPost(`/cuidador/solicitudes/${solicitud.id}/aceptar`, {});
      toast.success("Solicitud aceptada");

      if (actualizarSolicitudes) {
        const data = await apiGet<Solicitud[]>("/cuidador/solicitudes");
        actualizarSolicitudes((prev) =>
          prev.filter((s) => s.id !== solicitud.id)
        );
      }
    } catch (err) {
      toast.error("Error al aceptar solicitud");
      if (actualizarSolicitudes) {
        actualizarSolicitudes((prev) =>
          prev.filter((s) => s.id !== solicitud.id)
        );
      }
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const rechazarSolicitud = async () => {
    setLoading(true);
    try {
      await apiDelete(`/cuidador/solicitudes/${solicitud.id}`);
      toast.success("Solicitud rechazada");

      if (actualizarSolicitudes) {
        const data = await apiGet<Solicitud[]>("/cuidador/solicitudes");
        actualizarSolicitudes((prev) =>
          prev.filter((s) => s.id !== solicitud.id)
        );
      }
    } catch (err) {
      toast.error("Error al rechazar solicitud");
      if (actualizarSolicitudes) {
        actualizarSolicitudes((prev) =>
          prev.filter((s) => s.id !== solicitud.id)
        );
      }
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          Detalles
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl p-6 shadow-xl bg-white border border-gray-200 max-w-md w-full ">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {solicitud.servicio}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Cliente:</span> {solicitud.cliente}
          </p>
          <p>
            <span className="font-medium">Fecha inicio:</span>{" "}
            {solicitud.fecha_inicio}
          </p>
          <p>
            <span className="font-medium">Fecha fin:</span>{" "}
            {solicitud.fecha_fin}
          </p>
          <p>
            <span className="font-medium">Tipo de horario:</span> {solicitud.hora}
          </p>
          <p>
            <span className="font-medium">Horas:</span>
            <ul className="list-disc pl-5">
              {solicitud.rangos_horarios.map((rango, index) => (
                <li key={index} className="text-gray-600">
                  {rango}
                </li>
              ))}
            </ul>
          </p>
          <p>
            <span className="font-medium">Ubicación:</span>{" "}
            {solicitud.ubicacion}
          </p>
        </div>

        <Link href={`/carer/${solicitud.id}`}>
          <Button variant="secondary" className="w-full mt-4">
            Ver perfil del cliente
          </Button>
        </Link>

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            onClick={aceptarSolicitud}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Aceptar
          </Button>
          <Button
            onClick={rechazarSolicitud}
            disabled={loading}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Rechazar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
