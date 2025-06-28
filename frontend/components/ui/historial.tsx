"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CircleUserRound, Star } from "lucide-react";
import Image from "next/image";
import { CalificarModal } from "@/components/ui/CalificarModal";
import { apiGet, apiPost } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import PageTitle from "./title";

type Servicio = {
  id: number;
  cuidador: string;
  foto: string;
  fechaInicio: string;
  fechaFin: string;
  calificado: boolean;
  puntuacion?: number;
  enCurso: boolean;
};

type Props = {
  tipoUsuario: "cliente" | "cuidador";
};

export function HistorialServicios({ tipoUsuario }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cuidadorSeleccionado, setCuidadorSeleccionado] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const servicios_ex = [
          {
            id: 2,
            cuidador: "Carlos Rodríguez",
            foto: "/placeholder.jpg",
            fechaInicio: "2024/06/15",
            fechaFin: "2024/06/20",
            calificado: false,
            enCurso: true,
          },
          {
            id: 1,
            cuidador: "María González",
            foto: "/placeholder.jpg",
            fechaInicio: "2024/01/15",
            fechaFin: "2024/01/15",
            calificado: false,
            puntuacion: 5,
            enCurso: false,
          },
          {
            id: 3,
            cuidador: "María González",
            foto: "/placeholder.jpg",
            fechaInicio: "2024/01/15",
            fechaFin: "2024/01/15",
            calificado: true,
            puntuacion: 3,
            enCurso: false,
          },
        ]

  useEffect(() => {
    apiGet<Servicio[]>(`/${tipoUsuario}/historial`)
      .then((data) => {
        setServicios(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("No se pudieron cargar los servicios.");
        setServicios(servicios_ex);
        setLoading(false);
      });
  }, [tipoUsuario]);

  const abrirModal = (id: number, nombre: string) => {
    setCuidadorSeleccionado({ id, nombre });
    setModalOpen(true);
  };

  const enviarCalificacion = async (puntuacion: number, comentario: string) => {
    if (!cuidadorSeleccionado) return;
    try {
      //   await apiPost(`/cliente/calificar/${cuidadorSeleccionado.id}`, {
      //     puntuacion,
      //     comentario,
      //   });

      setLoading(true);
      const data = await apiGet<Servicio[]>(`/${tipoUsuario}/historial`);
      setServicios(data);
      setLoading(false);
    } catch (error) {
      toast.error("No se pudo enviar la calificacion.");
      setServicios(servicios_ex);
      setLoading(false);
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
          {servicios.map((servicio) => (
            <Card
              key={servicio.id}
              className="p-6 flex justify-between items-center"
            >
              <div className="flex items-center gap-6">
                {/* <Image
                  src={servicio.foto}
                  alt={servicio.cuidador}
                  width={64}
                  height={64}
                  className="rounded-full"
                /> */}
                <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto" />
                <div>
                  <p className="text-xl font-semibold">{servicio.cuidador}</p>
                  <p className="text-l text-gray-500">
                    {servicio.fechaInicio} - {servicio.fechaFin}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-base">
                <Link href={`/cuidador/${servicio.id}`}>
                  <Button variant="secondary">Ver perfil</Button>
                </Link>
                {servicio.enCurso ? (
                  <Badge className="text-base px-3 py-1 bg-green-100 text-green-700">EN CURSO</Badge>
                ) : servicio.calificado ? (
                  <div className="flex items-center text-yellow-500">
                    {Array(servicio.puntuacion)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-yellow-500 stroke-yellow-500" />
                      ))}
                  </div>
                ) : (
                  <Button className="text-base px-4 py-2" onClick={() => abrirModal(servicio.id, servicio.cuidador)}>
                    Calificar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {cuidadorSeleccionado && (
        <CalificarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          cuidadorId={cuidadorSeleccionado.id}
          cuidadorNombre={cuidadorSeleccionado.nombre}
          onSubmit={enviarCalificacion}
        />
      )}
    </div>
  );
}
