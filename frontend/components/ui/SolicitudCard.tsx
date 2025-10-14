"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, FileText } from "lucide-react";
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
    <Card className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-6">
        {solicitud.foto ? (
          <img 
            src={solicitud.foto} 
            alt={`Foto de ${solicitud.cliente}`} 
            className="h-20 w-20 rounded-full object-cover border-2 border-purple-600" 
          />
        ) : (
          <CircleUserRound className="h-12 w-12 text-blue-600" />
        )}
        <div className="flex flex-col gap-2">
          <p className="text-xl font-semibold">{solicitud.cliente}</p>
          <p className="text-base text-gray-500 w-2/3">{solicitud.servicio}</p>
          <p className="text-sm text-gray-500">
            {formatDate(solicitud.fecha_inicio)} - {formatDate(solicitud.fecha_fin)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onVerDetalles(solicitud.id)}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Detalles
        </Button>
        <Link href={perfilHref}>
          <Button variant="gradient" size="sm">Ver perfil</Button>
        </Link>
      </div>
    </Card>
  );
}

