"use client";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { apiDelete, apiPost } from "@/lib/api";
import { Solicitud } from "@/lib/types";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  FileText,
  Phone,
  Mail,
  Star
} from "lucide-react";
import { formatDate } from "@/lib/utils/dateFormat";

type Props = {
  solicitud: Solicitud;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actualizarSolicitudes: (updater: (prev: Solicitud[]) => Solicitud[]) => void;
  showActions?: boolean; // New prop to control action buttons visibility
};

export function DetalleSolicitudModal({
  solicitud,
  open,
  onOpenChange,
  actualizarSolicitudes,
  showActions = true, // Default to true for backward compatibility
}: Props) {
  const [loading, setLoading] = useState(false);

  const aceptarSolicitud = async () => {
    setLoading(true);
    try {
      // Acción custom en DRF: POST /api/servicios/{id}/aceptar/
      await apiPost(`/servicios/${solicitud.id}/aceptar/`, {});
      toast.success("Solicitud aceptada");
      // Remover del listado local (ya no es pendiente)
      actualizarSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
    } catch (err) {
      toast.error("Error al aceptar solicitud");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const rechazarSolicitud = async () => {
    setLoading(true);
    try {
      // Use the rechazar endpoint instead of direct deletion
      await apiPost(`/servicios/${solicitud.id}/rechazar/`, {});
      toast.success("Solicitud rechazada");
      // Remover del listado local
      actualizarSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
    } catch (err) {
      toast.error("Error al rechazar solicitud");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-0 shadow-2xl bg-white border-0 max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 md:px-6 py-4 md:py-5 flex-shrink-0">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
              <User className="h-5 w-5 md:h-6 md:w-6" />
              Solicitud de Servicio
            </DialogTitle>
            <p className="text-purple-100 text-xs md:text-sm mt-2">
              Detalles completos de la solicitud de {solicitud.cliente}
            </p>
          </DialogHeader>
        </div>

        <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
          {/* Client Information Card */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <img src={solicitud.foto} alt={solicitud.cliente} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-base md:text-lg text-gray-900">{solicitud.cliente}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span>{solicitud.cliente_ciudad}, {solicitud.cliente_provincia}</span>
                  </div>
                </div>
                <Link href={`/cliente/${solicitud.id_cliente}`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                    Ver Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Dates */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Fechas del Servicio</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inicio:</span>
                    <span className="font-medium">{formatDate(solicitud.fecha_inicio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin:</span>
                    <span className="font-medium">{formatDate(solicitud.fecha_fin)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Horario</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {(() => {
                        // Add time ranges based on the database values
                        const timeMap: { [key: string]: string } = {
                          'Mañana': 'Mañana (6:00 - 12:00)',
                          'Tarde': 'Tarde (12:00 - 18:00)',
                          'Noche': 'Noche (18:00 - 24:00)',
                          'Todo el dia': 'Todo el día (24 horas)'
                        };
                        return timeMap[solicitud.hora] || solicitud.hora;
                      })()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Days of the Week */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Días de la Semana</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {solicitud.dias_semanales && solicitud.dias_semanales.length > 0 ? (
                  solicitud.dias_semanales.map((dia, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {dia}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No especificado</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Types */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Sobre el Servicio</h4>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {Array.isArray(solicitud.servicio) ? solicitud.servicio.join('\n') : solicitud.servicio}
              </div>
            </CardContent>
          </Card>

         
        </div>

        {/* Action Buttons - Only show if showActions is true */}
        {showActions && (
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t flex-shrink-0">
            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
              <Button
                onClick={rechazarSolicitud}
                disabled={loading}
                variant="destructive"
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                <XCircle className="h-4 w-4" />
                {loading ? "Rechazando..." : "Rechazar"}
              </Button>
              <Button
                onClick={aceptarSolicitud}
                disabled={loading}
                variant="success"
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                <CheckCircle className="h-4 w-4" />
                {loading ? "Aceptando..." : "Aceptar"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
