"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Star,
  MessageCircle,
  ArrowLeft,
  CircleUserRound,
} from "lucide-react";
import Link from "next/link";

interface PerfilPublico {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  descripcion: string;
  foto_perfil: string;
  fotos: string[];
  categorias: string[];
  provincia: string;
  ciudad: string;
  rating?: number;
  reviews?: number;
  experiencia?: number;
  especialidad?: string;
  precio?: number;
  disponible?: boolean;
  tipo_usuario: "cliente" | "cuidador";
  certificados?: { file: string; name: string }[]
  experiencias?: { descripcion: string; fecha_inicio: string; fecha_fin: string }[]
}

export default function PerfilPublicoPage() {
  const params = useParams();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sampleReviews = [
    {
      id: 1,
      rating: 5,
      author: "Ana López",
      date: "Hace 2 semanas",
      comment:
        "Excelente cuidadora, muy profesional y cariñosa con mi madre. La recomiendo completamente. Siempre llegaba puntual y se notaba su experiencia en el trato con personas mayores.",
    },
    {
      id: 2,
      rating: 4,
      author: "Carlos Mendez",
      date: "Hace 1 mes",
      comment:
        "Muy responsable y puntual. Mi padre se sintió muy cómodo con su cuidado. Nos mantenía informados constantemente sobre el estado de papá.",
    },
    {
      id: 3,
      rating: 5,
      author: "María Fernández",
      date: "Hace 1 mes",
      comment:
        "Una persona excepcional. Cuidó a mi abuela durante 3 meses y siempre fue muy atenta y cariñosa. Tiene mucha paciencia y conocimiento sobre medicamentos.",
    },
    {
      id: 4,
      rating: 5,
      author: "Roberto Silva",
      date: "Hace 2 meses",
      comment:
        "Profesional de primera. Mi esposa tiene Alzheimer y María supo manejar la situación con mucha delicadeza y profesionalismo. Altamente recomendada.",
    },
    {
      id: 5,
      rating: 4,
      author: "Laura Martínez",
      date: "Hace 2 meses",
      comment:
        "Muy buena experiencia. Cuidó a mi madre durante su recuperación post-operatoria. Siempre atenta a los detalles y muy comunicativa con la familia.",
    },
    {
      id: 6,
      rating: 5,
      author: "Diego Ramírez",
      date: "Hace 3 meses",
      comment:
        "Excelente servicio. María es una persona muy confiable y profesional. Mi padre quedó muy contento con su atención y cuidado diario.",
    },
    {
      id: 7,
      rating: 5,
      author: "Carmen Ruiz",
      date: "Hace 3 meses",
      comment:
        "Una cuidadora excepcional. Tiene mucha experiencia y se nota en cada detalle. Mi madre la quiere mucho y siempre pregunta por ella.",
    },
    {
      id: 8,
      rating: 4,
      author: "Fernando Torres",
      date: "Hace 4 meses",
      comment:
        "Muy profesional y dedicada. Cuidó a mi suegra durante un período difícil y siempre mostró mucha empatía y comprensión.",
    },
  ];

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const data = await apiGet<PerfilPublico>(`/perfil/${params.id}`);
        setPerfil(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error al cargar el perfil. Mostrando datos de ejemplo.");

        setPerfil({
          id: Number(params.id),
          username: "mariagarcia",
          first_name: "María",
          last_name: "García",
          email: "maria.garcia@example.com",
          telefono: "+54 11 1234-5678",
          direccion: "Av. Corrientes 1234",
          fecha_nacimiento: "1985-03-15",
          descripcion:
            "Cuidadora profesional con más de 8 años de experiencia en el cuidado de adultos mayores. Especializada en pacientes con demencia y Alzheimer. Me caracterizo por mi paciencia, dedicación y trato cariñoso hacia las personas que cuido.",
          foto_perfil: "",
          fotos: [
            "/placeholder.svg?height=300&width=400",
            "/placeholder.svg?height=300&width=400",
            "/placeholder.svg?height=300&width=400",
          ],
          categorias: [
            "Edad avanzada",
            "Discapacidad motriz",
            "Enfermedades crónicas",
          ],
          provincia: "Buenos Aires",
          ciudad: "La Plata",
          rating: 4.8,
          reviews: 42,
          experiencia: 8,
          precio: 25,
          disponible: true,
          tipo_usuario: "cuidador",
          certificados: [
            { file: "/placeholder.pdf", name: "Certificado en Geriatría" },
            { file: "/placeholder.pdf", name: "Curso de Primeros Auxilios" },
            { file: "/placeholder.pdf", name: "Certificación en Cuidado de Alzheimer" },
          ],
          experiencias: [
            {
              descripcion:
                "Cuidadora en Residencia Geriátrica San José - Responsable del cuidado integral de 15 residentes con diferentes grados de dependencia.",
              fecha_inicio: "2020-01-15",
              fecha_fin: "2023-12-31",
            },
            {
              descripcion:
                "Cuidadora domiciliaria independiente - Atención personalizada a pacientes con demencia y Alzheimer en sus hogares.",
              fecha_inicio: "2018-03-01",
              fecha_fin: "2019-12-31",
            },
            {
              descripcion:
                "Auxiliar de enfermería en Hospital Municipal - Apoyo en el área de geriatría y cuidados paliativos.",
              fecha_inicio: "2016-06-01",
              fecha_fin: "2018-02-28",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPerfil();
    }
  }, [params.id]);

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

  if (!perfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Perfil no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El perfil que buscas no existe o no está disponible.
          </p>
          <Link href="/buscar">
            <Button>Volver a la búsqueda</Button>
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
                ({perfil.reviews} reseñas)
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
            {perfil.tipo_usuario === "cuidador" && perfil.certificados && perfil.certificados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {perfil.certificados.map((certificado, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                          <span className="font-medium text-gray-900">{certificado.name}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience Section */}
            {perfil.tipo_usuario === "cuidador" && perfil.experiencias && perfil.experiencias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Experiencia Laboral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {perfil.experiencias.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(exp.fecha_inicio).toLocaleDateString("es-ES", {
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(exp.fecha_fin).toLocaleDateString("es-ES", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{exp.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Reviews Section (placeholder) */}
          {/* Reviews Section with Scrollable Content */}
          {perfil.tipo_usuario === "cuidador" &&
            perfil.reviews &&
            perfil.reviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reseñas ({perfil.reviews})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {sampleReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium text-gray-900">
                              {review.author}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                  {sampleReviews.length > 5 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        Mostrando {sampleReviews.length} de {perfil.reviews}{" "}
                        reseñas
                      </p>
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
