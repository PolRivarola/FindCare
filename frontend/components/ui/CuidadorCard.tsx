"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MapPin } from "lucide-react";
import Link from "next/link";

interface CuidadorCardProps {
  cuidador: any;
  solicitudEnviada: boolean;
  onSolicitarServicio: () => void;
}

export function CuidadorCard({ cuidador, solicitudEnviada, onSolicitarServicio }: CuidadorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <img
              src={cuidador.foto_perfil || "/placeholder-user.jpg"}
              alt={cuidador.nombre}
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-200"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {cuidador.nombre}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{cuidador.ciudad}, {cuidador.provincia}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{cuidador.rating || "N/A"}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Heart className="h-4 w-4" />
                <span>{cuidador.experiencia} años de experiencia</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex flex-wrap gap-2">
                {cuidador.especialidad.map((esp: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {esp}
                  </Badge>
                ))}
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {cuidador.descripcion.length > 150 
                ? `${cuidador.descripcion.substring(0, 150)}...` 
                : cuidador.descripcion}
            </p>
            
            <div className="flex gap-3">
              <Link href={`/cuidador/${cuidador.id}`}>
                <Button variant="outline">Ver Perfil</Button>
              </Link>
              <Button
                variant={solicitudEnviada ? "success" : "gradient"}
                disabled={solicitudEnviada}
                onClick={onSolicitarServicio}
              >
                {solicitudEnviada ? "Solicitud enviada" : "Solicitar Servicio"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
