"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  History,
  User,
  MessageCircle,
  Calendar,
  Star,
  MessageCircleQuestion,
  CircleUserRound,
} from "lucide-react";
import Link from "next/link";

export default function ClienteDashboard() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [hasCarer, setHasCarer] = useState(true);

  const recentServices = [
    {
      id: 1,
      cuidador: "María González",
      fecha_inicio: "2024/01/15",
      fecha_fin: "2024/01/15",
      servicio: "Cuidado diurno",
      estado: "Completado",
      rating: 5,
    },
    {
      id: 2,
      cuidador: "Carlos Rodríguez",
      fecha_inicio: "2024/01/10",
      fecha_fin: "2024/01/15",
      servicio: "Acompañamiento médico",
      estado: "Calificar",
      rating: undefined,
    },
  ];

  const upcomingServices = [
    {
      id: 3,
      cuidador: "Ana Martínez",
      fecha: "2024-01-20",
      hora: "09:00",
      servicio: "Cuidado nocturno",
    },
    {
      id: 4,
      cuidador: "Ana Martínez",
      fecha: "2024-01-20",
      hora: "09:00",
      servicio: "Cuidado nocturno",
    },
    {
      id: 5,
      cuidador: "Ana Martínez",
      fecha: "2024-01-20",
      hora: "09:00",
      servicio: "Cuidado nocturno",
    },
    {
      id: 6,
      cuidador: "Ana Martínez",
      fecha: "2024-01-20",
      hora: "09:00",
      servicio: "Cuidado nocturno",
    },
    {
      id: 7,
      cuidador: "Ana Martínez",
      fecha: "2024-01-20",
      hora: "09:00",
      servicio: "Cuidado nocturno",
    },
  ];

  return (
    
     
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 border-2 border-blue-100 bg-blue-50 p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, Juan Pérez!
          </h1>
          <p className="text-gray-600">
            Gestiona tus servicios de cuidado y encuentra los mejores cuidadores
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {hasCarer ? (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Buscar Cuidadores
                </h3>
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Encuentra el cuidador perfecto
                </p>
                <Link href="/cliente/buscar">
                  <Button className="w-full">Buscar Ahora</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Cuidador actual</h3>
                <CircleUserRound className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Martin Caceres</p>
                <Link href="/cliente/chat">
                  <Button className="w-full ">Enviar mensaje</Button>
                </Link>
                <Link href="/cliente/buscar">
                  <Button className="w-full mt-3 ">Ver perfil</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Mensajes</h3>
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />

              <p className="text-gray-600 mb-4">
                Comunícate con tus cuidadores
              </p>
              <Link href="/cliente/chat">
                <Button className="w-full  bg-purple-600 text-white hover:bg-white hover:text-purple-600 hover:border-purple-600 hover:border-2">
                  Ver Mensajes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Necesitas Ayuda?</h3>
              <MessageCircleQuestion className="h-12 w-12 text-green-600 mx-auto mb-4" />

              <p className="text-gray-600 mb-4">Estamos para ayudarte</p>
              <Link href="https://wa.me/543516655333">
                <Button className="w-full  bg-green-600 text-white hover:bg-white hover:text-green-600 hover:border-green-600 hover:border-2">
                  Contáctanos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Servicios Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{service.cuidador}</h4>
                      <p className="text-sm text-gray-500">
                        {service.fecha_inicio}-{service.fecha_fin}
                      </p>
                    </div>
                    <div className="text-right">
                      {service.estado === "Completado" ? (
                        ""
                      ) : (
                        <Badge variant="secondary" className="mb-2">
                          {service.estado}
                        </Badge>
                      )}

                      {service.rating ? (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < service.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/cliente/historial">
                  <Button variant="outline" className="w-full">
                    Ver Todo el Historial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Scroll container with max height */}
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                {upcomingServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                  >
                    <div>
                      <h4 className="font-medium">{service.cuidador}</h4>
                      <p className="text-sm text-blue-600 font-medium">
                        {service.fecha} a las {service.hora}
                      </p>
                    </div>
                    <div>
                      <Button size="sm">Contactar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}
