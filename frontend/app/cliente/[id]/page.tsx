"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  MessageCircle,
  ArrowLeft,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
} from "lucide-react";
import Link from "next/link";
import { PerfilPublico } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { ReviewCard } from "@/components/ui/ReviewCard";

// Using PerfilPublico from types

export default function PerfilClientePage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useUser();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  const sampleTestimonials = [
    {
      id: 1,
      rating: 5,
      author: "María González",
      date: "2024-01-15",
      comment:
        "Familia muy respetuosa y cariñosa. Siempre me trataron con mucha consideración y respeto. La comunicación fue excelente durante todo el tiempo que cuidé a la abuela.",
    },
    {
      id: 2,
      rating: 4,
      author: "Carlos Rodríguez",
      date: "2024-01-08",
      comment:
        "Excelente familia para trabajar. Muy organizados y claros con las instrucciones. El ambiente familiar es muy cálido y acogedor.",
    },
    {
      id: 3,
      rating: 5,
      author: "Ana Martínez",
      date: "2023-12-20",
      comment:
        "Una familia comprometida con el bienestar de su ser querido. Siempre disponibles para cualquier consulta y muy agradecidos por el trabajo realizado.",
    },
    {
      id: 4,
      rating: 4,
      author: "Luis Fernández",
      date: "2023-12-15",
      comment:
        "Trabajar con esta familia fue una experiencia muy positiva. Son personas muy humanas y comprensivas. Recomiendo trabajar con ellos.",
    },
    {
      id: 5,
      rating: 5,
      author: "Sofia Hernández",
      date: "2023-11-30",
      comment:
        "Familia muy responsable y puntual con los pagos. El trato siempre fue profesional y respetuoso. Muy buena experiencia laboral.",
    },
    {
      id: 6,
      rating: 4,
      author: "Roberto Silva",
      date: "2023-11-15",
      comment:
        "Excelente comunicación y muy claros con las expectativas. La familia siempre estuvo presente y disponible para cualquier emergencia.",
    },
  ];

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (!imageModalOpen) return;
      if (e.key === "Escape") {
        setImageModalOpen(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentImageIndex((idx) =>
          idx === 0 ? (perfil?.fotos.length || 1) - 1 : idx - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((idx) =>
          idx === (perfil?.fotos.length || 1) - 1 ? 0 : idx + 1
        );
      }
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [imageModalOpen, perfil?.fotos.length]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const data = await apiGet<PerfilPublico>(`/perfil/${params.id}`);
        setPerfil(data);
        // Check if current user is not the owner
        setNotOwner(currentUser?.id !== data.id);
      } catch (error) {
        toast.error("Error al cargar el perfil");
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchPerfil();
  }, [params.id, currentUser?.id]);

  const calcularEdad = (fecha: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

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
      const convId = data.id;
      router.push(`/cuidador/chat?c=${convId}`);
    } catch {
      toast.error("No se pudo abrir el chat");
    }
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

  if (!perfil || perfil.tipo_usuario !== "cliente") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Perfil no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El perfil que buscas no existe o no está disponible.
          </p>
          <Link href="/cliente/dashboard">
            <Button>Volver al dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={perfil.foto_perfil || "/placeholder.svg"}
            alt={`${perfil.first_name} ${perfil.last_name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {perfil.first_name} {perfil.last_name}
            </h1>
            <p className="text-xl text-blue-600 font-medium">Cliente</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {perfil.ciudad}, {perfil.provincia}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {calcularEdad(perfil.fecha_nacimiento)} años
              </div>
            </div>
            {notOwner && (
              <div className="mt-3">
                <Button onClick={crearChat} className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chatear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Photos and Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photo Gallery */}
          {perfil.fotos && perfil.fotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galería Familiar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={
                        perfil.fotos[currentImageIndex] || "/placeholder.svg"
                      }
                      alt="Foto familiar"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setImageModalOpen(true)}
                    />

                    {/* Navigation arrows for main image */}
                    {perfil.fotos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(
                              currentImageIndex === 0
                                ? perfil.fotos.length - 1
                                : currentImageIndex - 1
                            );
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(
                              currentImageIndex === perfil.fotos.length - 1
                                ? 0
                                : currentImageIndex + 1
                            );
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {perfil.fotos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {perfil.fotos.length}
                      </div>
                    )}
                  </div>

                  {perfil.fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {perfil.fotos.map((foto, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? "border-blue-500 scale-105"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={foto || "/placeholder.svg"}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Screen Image Modal */}
          {imageModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={perfil.fotos[currentImageIndex] || "/placeholder.svg"}
                  alt="Foto familiar ampliada"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />

                {/* Close button */}
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Navigation in modal */}
                {perfil.fotos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === 0
                            ? perfil.fotos.length - 1
                            : currentImageIndex - 1
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === perfil.fotos.length - 1
                            ? 0
                            : currentImageIndex + 1
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image counter in modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {perfil.fotos.length}
                </div>

                {/* Thumbnail navigation in modal */}
                {perfil.fotos.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                    <div className="flex gap-2 overflow-x-auto max-w-md">
                      {perfil.fotos.map((foto, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? "border-white"
                              : "border-gray-400 hover:border-gray-200"
                          }`}
                        >
                          <img
                            src={foto || "/placeholder.svg"}
                            alt={`Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
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
                <span className="text-gray-700">
                  {perfil.ciudad}, {perfil.provincia}
                </span>
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

          {/* Care Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Necesidades de Cuidado</CardTitle>
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

          {/* Calificaciones recibidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Calificaciones Recibidas
              </CardTitle>
            </CardHeader>
            <CardContent>
                {Array.isArray(perfil.reviews) && perfil.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {perfil.reviews.map((r: any) => (
                      <ReviewCard
                        key={r.id}
                        id={r.id}
                        rating={r.rating}
                        comment={r.comment}
                        date={r.date}
                        author={r.author}
                        variant="compact"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no recibió calificaciones.</p>
                </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
