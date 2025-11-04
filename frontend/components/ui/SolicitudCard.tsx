"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, FileText, User } from "lucide-react";
import Link from "next/link";
import type { Solicitud } from "@/lib/types";
import { formatDate } from "@/lib/utils/dateFormat";

interface SolicitudCardProps {
  solicitud: Solicitud;
  onVerDetalles: (id: number) => void;
}

export function SolicitudCard({ solicitud, onVerDetalles }: SolicitudCardProps) {
  const perfilHref = `/cliente/${solicitud.id_cliente}`;

  return (
    <Card className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors gap-4">
      <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
        {solicitud.foto ? (
          <img 
            src={solicitud.foto} 
            alt={`Foto de ${solicitud.cliente}`} 
            className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-purple-600 flex-shrink-0" 
          />
        ) : (
          <CircleUserRound className="h-16 w-16 md:h-20 md:w-20 text-blue-600 flex-shrink-0" />
        )}
        <div className="flex flex-col gap-1 md:gap-2 flex-1 min-w-0">
          <p className="text-lg md:text-xl font-semibold truncate">{solicitud.cliente}</p>
          <p className="text-sm md:text-base text-gray-500 line-clamp-2">{solicitud.servicio}</p>
          <p className="text-xs md:text-sm text-gray-500">
            {formatDate(solicitud.fecha_inicio)} - {formatDate(solicitud.fecha_fin)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onVerDetalles(solicitud.id)}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4"
        >
          <FileText className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden xs:inline">Detalles</span>
        </Button>
        <Link href={perfilHref} className="w-auto">
          <Button variant="gradient" size="sm" className="text-xs md:text-sm px-3 md:px-4">
            <span className="hidden xs:inline">Ver perfil</span>
            <User className="h-3 w-3 md:h-4 md:w-4 xs:hidden" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

