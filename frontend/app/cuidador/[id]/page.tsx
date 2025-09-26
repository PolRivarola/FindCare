"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Phone, Mail, Star, CircleUserRound, MessageCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { PerfilPublico } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { ReviewCard } from "@/components/ui/ReviewCard";

export default function PerfilPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useUser();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const data = await apiGet<PerfilPublico>(`/perfil/${params.id}`);
        setPerfil(data);

      } catch (error) {
        
        toast.error("Error al cargar el perfil");
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPerfil();
    }
  }, [params.id]);

  const notOwner = Boolean(currentUser && perfil && currentUser.id !== perfil.id);

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!perfil || perfil.tipo_usuario !== "cuidador") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Perfil no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El perfil que buscas no existe o no está disponible.
          </p>
          <Link href="/cuidador/dashboard">
            <Button>Volver a Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const crearChat = async () => {
    if (!perfil) return;
    try {
      const res = await fetch("/api/b/conversaciones/ensure/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: perfil.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const chatPath = currentUser?.es_cliente ? "/cliente/chat" : "/cuidador/chat";
      router.push(`${chatPath}?c=${data.id}`);
    } catch {
      toast.error("No se pudo abrir el chat");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {perfil.foto_perfil ? (
            <img
              src={perfil.foto_perfil}
              alt={`${perfil.first_name} ${perfil.last_name}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <CircleUserRound size={96} className="text-gray-400" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {perfil.first_name} {perfil.last_name}
            </h1>
            {perfil.especialidad && (
              <p className="text-xl text-blue-600 font-medium">
                {perfil.especialidad}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {calcularEdad(perfil.fecha_nacimiento)} años
              </div>
              {perfil.experiencia && (
                <div>{perfil.experiencia} años de experiencia</div>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Status */}
        <div className="flex items-center gap-6">
          {perfil.rating && (
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">{perfil.rating}</span>
              <span className="text-gray-600 ml-1">
                ({perfil.reviews_count} reseñas)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Photos and Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-gray-700">{perfil.telefono}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-gray-700">{perfil.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-gray-700">{perfil.direccion}</span>
              </div>
            </CardContent>
          </Card>
          {/* Categories/Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>
                {perfil.tipo_usuario === "cuidador"
                  ? "Especialidades"
                  : "Necesidades de Cuidado"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {perfil.categorias.map((categoria, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {categoria}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre {perfil.first_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {perfil.descripcion}
              </p>
            </CardContent>
          </Card>

          {/* Certificates Section */}
          {perfil.tipo_usuario === "cuidador" &&
            perfil.certificados &&
            perfil.certificados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {perfil.certificados.map((certificado, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">
                            {certificado.name}
                          </span>
                        </div>

                        {/* Botón para descargar el certificado */}
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={certificado.file}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Experience Section */}
          {perfil.tipo_usuario === "cuidador" &&
            perfil.experiencias &&
            perfil.experiencias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Experiencia Laboral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {perfil.experiencias.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 pb-4 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(exp.fecha_inicio).toLocaleDateString(
                              "es-ES",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(exp.fecha_fin).toLocaleDateString(
                              "es-ES",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {exp.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Reviews Section */}
          {perfil.tipo_usuario === "cuidador" && (
            <Card>
              <CardHeader>
                <CardTitle>Reseñas ({perfil.reviews_count || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {perfil.reviews && perfil.reviews.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {perfil.reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        id={review.id}
                        rating={review.rating}
                        comment={review.comment}
                        date={review.date}
                        author={review.author}
                        variant="compact"
                        className="border-b border-gray-200 pb-4 last:border-b-0 bg-transparent p-0"
                      />
                    ))}
                    {perfil.reviews.length > 5 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Mostrando {perfil.reviews.length} de{" "}
                          {perfil.reviews_count} reseñas
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no recibió calificaciones.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
