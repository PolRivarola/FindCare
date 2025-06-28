"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, MapPin, Star, Clock, Filter } from "lucide-react";
import Link from "next/link";
import PageTitle from "@/components/ui/title";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Solicitud } from "@/lib/types";

export default function BuscarCuidadoresPage() {
  const [filters, setFilters] = useState({
    especialidad: [] as string[],
    disponibilidad: "",
    experiencia: "",
  });
  const [orden, setOrden] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cuidadores, setCuidadores] = useState<any[]>([]);
  const [selectedCuidador, setSelectedCuidador] = useState<any>(null);
  const [solicitudEnviada, setSolicitudEnviada] = useState<
    Record<number, boolean>
  >({});
  const [formData, setFormData] = useState({
    servicio: [] as string[],
    fecha_inicio: "",
    fecha_fin: "",
    hora: "",
    rangos_horarios: [] as string[],
    ubicacion: "",
    foto: "",
    descripcion: "",
  });
  const [serviciosDisponibles, setServiciosDisponibles] = useState<string[]>(
    []
  );

  const ubicaciones: Record<string, string[]> = {
    "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
    Córdoba: ["Córdoba Capital", "Villa María", "Río Cuarto"],
    "Santa Fe": ["Rosario", "Santa Fe Capital", "Rafaela"],
    Mendoza: ["Mendoza Capital", "San Rafael"],
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinciaChange = (value: string) => {
    setProvincia(value);
    setCiudad("");
  };

  const handleCiudadChange = (value: string) => {
    setCiudad(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuidadoresData, servicios] = await Promise.all([
          apiGet<any[]>("/api/cuidadores"),
          apiGet<string[]>("/api/servicios"),
        ]);
        setCuidadores(cuidadoresData);
        setServiciosDisponibles(servicios);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos. Usando valores de ejemplo.");

        setCuidadores(cuidadores_ex);
        setServiciosDisponibles([
          "Discapacidad Intelectual",
          "Edad Avanzada",
          "Discapacidad Motriz",
          "Cuidado Postoperatorio",
          "Acompanamiento Médico",
        ]);
      }
    };

    fetchData();
  }, []);

  const handleSolicitud = async () => {
    if (!selectedCuidador) return;

    try {
      const solicitudData: Solicitud = {
        id_cliente: 1,
        id_cuidador: 1, 
        id: Date.now(), 
        cliente: "Usuario Actual",
        servicio: formData.servicio,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        hora: formData.hora,
        rangos_horarios: formData.rangos_horarios,
        ubicacion: formData.ubicacion,
        foto: formData.foto,
      };

      await apiPost("/api/solicitudes", solicitudData);

      toast.success("Solicitud enviada correctamente");
      setSolicitudEnviada((prev) => ({ ...prev, [selectedCuidador.id]: true }));
      setModalOpen(false);

      setFormData({
        servicio: [],
        fecha_inicio: "",
        fecha_fin: "",
        hora: "",
        rangos_horarios: [],
        ubicacion: "",
        foto: "",
        descripcion: "",
      });
    } catch (error) {
      console.error("Error sending solicitud:", error);
      toast.error("Error al enviar la solicitud. Inténtalo de nuevo.");
    }
  };

  const openModal = (cuidador: any) => {
    setSelectedCuidador(cuidador);
    setModalOpen(true);
  };

  const cuidadores_ex = [
    {
      id: 1,
      nombre: "María González",
      especialidad: ["Geriatría"],
      experiencia: 5,
      provincia: "Buenos Aires",
      ciudad: "La Plata",
      rating: 4.9,
      reviews: 45,
      precio: 25,
      disponible: true,
      descripcion:
        "Especialista en cuidado de adultos mayores con experiencia en demencia y Alzheimer.",
      imagen: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez",
      especialidad: ["Edad Avanzada"],
      experiencia: 8,
      provincia: "Buenos Aires",
      ciudad: "Mar del Plata",
      rating: 4.8,
      reviews: 32,
      precio: 30,
      disponible: true,
      descripcion:
        "Enfermero registrado con experiencia en cuidados post-operatorios y medicación.",
      imagen: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      nombre: "Ana Martínez",
      especialidad: ["Discapacidad Intelectual"],
      experiencia: 3,
      provincia: "Córdoba",
      ciudad: "Villa María",
      rating: 4.7,
      reviews: 28,
      precio: 22,
      disponible: false,
      descripcion:
        "Especializada en cuidado de personas con discapacidades físicas y cognitivas.",
      imagen: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 4,
      nombre: "Luis Fernández",
      especialidad: ["Discapacidad Motriz", "Acompanamiento Médico"], 
      experiencia: 6,
      provincia: "Mendoza",
      ciudad: "San Rafael",
      rating: 4.9,
      reviews: 51,
      precio: 35,
      disponible: true,
      descripcion:
        "Fisioterapeuta con especialización en rehabilitación geriátrica.",
      imagen: "/placeholder.svg?height=100&width=100",
    },
  ];

  const cuidadoresFiltrados = cuidadores.filter((c) => {
    const listado = Array.isArray(c.especialidad)
      ? c.especialidad.map((e: string) => e.toLowerCase())
      : typeof c.especialidad === "string"
      ? [c.especialidad.toLowerCase()]
      : [];

    const coincide =
      filters.especialidad.length === 0 ||
      filters.especialidad.some((f) => listado.includes(f.toLowerCase()));
    return (
      coincide &&
      (!filters.experiencia ||
        c.experiencia >= parseInt(filters.experiencia)) &&
      (!provincia || c.provincia.toLowerCase() === provincia.toLowerCase()) &&
      (!ciudad || c.ciudad.toLowerCase() === ciudad.toLowerCase())
    );
  });

  const cuidadoresOrdenados = [...cuidadoresFiltrados].sort((a, b) => {
    if (orden === "rating") return b.rating - a.rating;
    if (orden === "experiencia") return b.experiencia - a.experiencia;
    if (orden === "precio-asc") return a.precio - b.precio;
    if (orden === "precio-desc") return b.precio - a.precio;
    return 0;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <PageTitle>Buscar Cuidadores</PageTitle>
        <p className="text-gray-600">
          Encuentra el cuidador perfecto para tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filtros */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Especialidades</Label>
                <div className="space-y-2 mt-2">
                  {serviciosDisponibles.map((servicio) => (
                    <div key={servicio} className="flex items-center space-x-2">
                      <Checkbox
                        id={servicio}
                        checked={filters.especialidad.includes(servicio)}
                        onCheckedChange={(checked) => {
                          setFilters((prev) => {
                            const nuevaEspecialidad = checked
                              ? [...prev.especialidad, servicio]
                              : prev.especialidad.filter((s) => s !== servicio);
                            return { ...prev, especialidad: nuevaEspecialidad };
                          });
                        }}
                      />
                      <label htmlFor={servicio}>
                        {servicio.replace(/-/g, " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Provincia</Label>
                <Select value={provincia} onValueChange={handleProvinciaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ubicaciones).map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ciudad</Label>
                <Select
                  value={ciudad}
                  onValueChange={handleCiudadChange}
                  disabled={!provincia}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        provincia
                          ? "Seleccionar"
                          : "Primero selecciona una provincia"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {provincia &&
                      ubicaciones[provincia].map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experiencia Mínima</Label>
                <Select
                  onValueChange={(v) => handleFilterChange("experiencia", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+ años</SelectItem>
                    <SelectItem value="3">3+ años</SelectItem>
                    <SelectItem value="5">5+ años</SelectItem>
                    <SelectItem value="10">10+ años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    especialidad: [],
                    disponibilidad: "",
                    experiencia: "1",
                  });
                  setProvincia("");
                  setCiudad("");
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Mostrando {cuidadoresFiltrados.length} cuidadores
            </p>
            <Select onValueChange={(v) => setOrden(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="experiencia">Más experiencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cuidadoresOrdenados.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={c.imagen}
                    alt={c.nombre}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-semibold">{c.nombre}</h3>
                    </div>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-4 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        {c.rating} ({c.reviews} reseñas)
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {c.ciudad}, {c.provincia}
                      </div>
                      <div>{c.experiencia} años de experiencia</div>
                    </div>
                    <p className="text-gray-600 mb-4">{c.descripcion}</p>
                    <div className="flex gap-3">
                      <Link href={`/cuidador/${c.id}`}>
                        <Button variant="outline">Ver Perfil</Button>
                      </Link>
                      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={solicitudEnviada[c.id]}
                            onClick={() => openModal(c)}
                          >
                            {solicitudEnviada[c.id]
                              ? "Solicitud enviada"
                              : "Solicitar Servicio"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-blue-600">
                              Solicitar Servicio - {selectedCuidador?.nombre}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="servicio">Tipo de Servicio</Label>
                              <div className="space-y-2 mt-2">
                                {[
                                  "discapacidad-intelectual",
                                  "edad-avanzada",
                                  "discapacidad-motriz",
                                  "cuidado-postoperatorio",
                                  "acompanamiento-medico",
                                ].map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={item}
                                      checked={formData.servicio.includes(item)}
                                      onCheckedChange={(checked) => {
                                        setFormData((prev) => {
                                          const servicio = checked
                                            ? [...prev.servicio, item]
                                            : prev.servicio.filter(
                                                (s) => s !== item
                                              );
                                          return { ...prev, servicio };
                                        });
                                      }}
                                    />
                                    <label
                                      htmlFor={item}
                                      className="text-sm text-gray-700 capitalize"
                                    >
                                      {item.replace(/-/g, " ")}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fecha_inicio">
                                  Fecha Inicio
                                </Label>
                                <Input
                                  id="fecha_inicio"
                                  type="date"
                                  value={formData.fecha_inicio}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      fecha_inicio: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                                <Input
                                  id="fecha_fin"
                                  type="date"
                                  value={formData.fecha_fin}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      fecha_fin: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="hora">Horario</Label>
                              <Select
                                value={formData.hora}
                                onValueChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    hora: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar horario" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">
                                    Mañana (8:00 - 14:00)
                                  </SelectItem>
                                  <SelectItem value="night">
                                    Noche (18:00 - 8:00)
                                  </SelectItem>
                                  <SelectItem value="whole-day">
                                    Todo el día (24 horas)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="ubicacion">Ubicación</Label>
                              <Input
                                id="ubicacion"
                                value={formData.ubicacion}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    ubicacion: e.target.value,
                                  }))
                                }
                                placeholder="Dirección donde se prestará el servicio"
                              />
                            </div>

                            <div>
                              <Label htmlFor="descripcion">
                                Descripción del servicio
                              </Label>
                              <Textarea
                                id="descripcion"
                                value={formData.descripcion || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    descripcion: e.target.value,
                                  }))
                                }
                                placeholder="Describe las necesidades específicas del cuidado..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="rangos_horarios">
                                Horarios de Servicio
                              </Label>
                              <Textarea
                                id="rangos_horarios"
                                value={formData.rangos_horarios.join(", ")}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    rangos_horarios: e.target.value
                                      .split(",")
                                      .map((s) => s.trim()),
                                  }))
                                }
                                placeholder="Ej: 8:00-12:00, 14:00-18:00"
                              />
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleSolicitud}
                                className="flex-1"
                              >
                                Enviar Solicitud
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}
function setServiciosDisponibles(especialidad: string[]) {
  throw new Error("Function not implemented.");
}
