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
import { Solicitud } from "@/lib/types";

type Props = {
  tipoUsuario: "cliente" | "cuidador";
};

export default function SolicitudesServicios({ tipoUsuario }: Props) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpenId, setModalOpenId] = useState<number | null>(null);

  const solicitudes_ex: Solicitud[] = [
    {
      id: 1,
      id_cliente: 1,
      id_cuidador: 1,
      foto: "/placeholder.jpg",
      cliente: "Mario Perez",
      servicio: ["Edad avanzada, Discapacidad motriz"],
      fecha_inicio: "2024-01-22",
      fecha_fin: "2024-01-22",
      hora: "Todo el día",
      ubicacion: "Centro, Montevideo",
      rangos_horarios: [
        "08:00 - 12:00" ,
        "05:00 - 6:00",
      ],
    },
    {
      id: 2,
      id_cliente: 1,
      id_cuidador: 1,
      foto: "/placeholder.jpg",
      cliente: "María López",
      servicio: ["Discapacidad intelectual"],
      fecha_inicio: "2024-01-22",
      fecha_fin: "2024-01-22",
      hora: "Todo el día",
      ubicacion: "Centro, Montevideo",
      rangos_horarios: [
        "08:00 - 12:00" ,
        "05:00 - 6:00",
      ],
    },
    {
      id: 3,
      id_cliente: 1,
      id_cuidador: 1,
      foto: "/placeholder.jpg",
      cliente: "Pablo Bernal",
      servicio: ["Discapacidad motriz"],
      fecha_inicio: "2024-01-22",
      fecha_fin: "2024-01-22",
      hora: "Todo el día",
      ubicacion: "Centro, Montevideo",
      rangos_horarios: [
        "08:00 - 12:00" ,
        "05:00 - 6:00",
      ],
    },
  ];

  useEffect(() => {
    apiGet<Solicitud[]>(`/${tipoUsuario}/historial`)
      .then((data) => {
        setSolicitudes(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("No se pudieron cargar las solicitudes.");
        setSolicitudes(solicitudes_ex);
        setLoading(false);
      });
  }, [tipoUsuario]);

  const actualizarSolicitudes = (
    updater: (prev: Solicitud[]) => Solicitud[]
  ) => {
    setSolicitudes((prev) => updater(prev));
  };

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
          {solicitudes.map((servicio) => (
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
                <Link href={`/cuidador/${servicio.id}`}>
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
          ))}
        </div>
      )}
    </div>
  );
}
