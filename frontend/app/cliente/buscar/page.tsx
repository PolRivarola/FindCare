"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolicitarServicioModal } from "@/components/ui/SolicitarServicioModal";
import { FilterComponent } from "@/components/ui/FilterComponent";
import { CuidadorCard } from "@/components/ui/CuidadorCard";
import PageTitle from "@/components/ui/title";
import { useCuidadoresSearch } from "@/hooks/useCuidadoresSearch";
import { useServiceRequest } from "@/hooks/useServiceRequest";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";

export default function BuscarCuidadoresPage() {
  const [filters, setFilters] = useState({
    especialidad: [] as number[],
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
  const [modalLoading, setModalLoading] = useState(false);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [diasSemanales, setDiasSemanales] = useState<any[]>([]);
  const [horariosDiarios, setHorariosDiarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cuidadoresMeta, setCuidadoresMeta] = useState({ page: 1, count: 0, hasNext: false });
  const firstSearchRef = useRef(true);

  const {
    cuidadores,
    loading,
    serviciosDisponibles,
    provincias,
    ciudades,
    diasSemanales,
    horariosDiarios,
    searchCuidadores,
  } = useCuidadoresSearch();

  const {
    modalOpen,
    selectedCuidador,
    solicitudEnviada,
    modalLoading,
    openModal,
    closeModal,
    handleSolicitud,
  } = useServiceRequest();

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleEspecialidadChange = (especialidad: number[]) => {
    setFilters((prev) => ({ ...prev, especialidad }));
  };

  const handleProvinciaChange = (provincia: string) => {
    setProvincia(provincia);
    setCiudad(""); // Reset city when province changes
  };

  const handleCiudadChange = (ciudad: string) => {
    setCiudad(ciudad);
  };

  const handleClearFilters = () => {
    setFilters({
      especialidad: [],
      experiencia: "",
    });
    setProvincia("");
    setCiudad("");
    setOrden("");
  };

  const performSearch = () => {
    searchCuidadores({
      filters,
      orden,
      provincia,
      ciudad,
    });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cuidadoresResp, servicios, provinciasData, diasData, horariosData] = await Promise.all([
          apiGet<PaginatedResponse<any>>("/search/"),
          apiGet<any[]>("/tipos-cliente/"),
          apiGet<any[]>("/provincias/"),
          apiGet<any[]>("/dias-semanales/"),
          apiGet<any[]>("/horarios-diarios/"),
        ]);
        setCuidadores(cuidadoresResp.results);
        setCuidadoresMeta({
          page: 1,
          count: cuidadoresResp.count,
          hasNext: Boolean(cuidadoresResp.next),
        });
        setServiciosDisponibles(servicios);
        setProvincias(provinciasData);
        setDiasSemanales(diasData);
        setHorariosDiarios(horariosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos.");
      } finally {
        setLoading(false);
        firstSearchRef.current = false;
      }
    };

    fetchData();
  }, []);

  // Fetch ciudades when provincia changes
  useEffect(() => {
    if (provincia) {
      const fetchCiudades = async () => {
        try {
          const ciudadesData = await apiGet<any[]>(`/ciudades/?provincia=${provincia}`);
          setCiudades(ciudadesData);
        } catch (error) {
          console.error("Error al cargar ciudades:", error);
          toast.error("Error al cargar las ciudades.");
        }
      };
      fetchCiudades();
    } else {
      setCiudades([]);
    }
  }, [provincia]);

  // Search cuidadores with filters
  const searchCuidadores = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const searchParams: any = {};
      if (provincia) searchParams.provincia = provincia;
      if (ciudad) searchParams.ciudad = ciudad;
      if (filters.experiencia) searchParams.min_experiencia = filters.experiencia;
      if (filters.especialidad.length > 0) searchParams.especialidad = filters.especialidad;
      if (orden) searchParams.ordering = orden;
      searchParams.page = page;

      const response = await apiGet<PaginatedResponse<any>>("/search/", searchParams);

      setCuidadores((prev) => (append ? [...prev, ...response.results] : response.results));
      setCuidadoresMeta({
        page,
        count: response.count,
        hasNext: Boolean(response.next),
      });
    } catch (error) {
      console.error("Error al buscar cuidadores:", error);
      toast.error("Error al buscar cuidadores.");
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Auto-search when filters change
  useEffect(() => {
    if (serviciosDisponibles.length > 0) {
      performSearch();
    if (firstSearchRef.current) return;
    searchCuidadores(1, false);
  }, [provincia, ciudad, filters, orden]);

  const handleSolicitud = async (formData: any) => {
    if (!selectedCuidador) return;
    
    if (diasSemanales.length === 0) {
      toast.error("Los días de la semana aún no se han cargado. Por favor, intenta de nuevo.");
      return;
    }

    try {
      setModalLoading(true);
      
      // Convert service types to description text
      const serviceTypesText = formData.servicio.map((service: string) => 
        service.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      ).join(', ');
      
      // Build description with service types and additional details
      let descripcion = `Tipos de servicio solicitados: ${serviceTypesText}`;
      if (formData.descripcion) {
        descripcion += `\n\n- Descripción adicional: ${formData.descripcion}`;
      }

      // Convert day names to IDs
      const convertirDiasAIds = (diaNames: string[]) => {
        if (diasSemanales.length === 0) {
          console.error("No se han cargado los días semanales desde la API");
          toast.error("Error: No se pudieron cargar los días de la semana");
          return [];
        }
        
        const result = diaNames.map(diaName => {
          // Buscar coincidencia exacta
          let diaSemanalesEncontrado = diasSemanales.find(dia => dia.nombre === diaName);
          
          // Si no encuentra coincidencia exacta, intentar buscar sin tildes
          if (!diaSemanalesEncontrado) {
            const normalizedName = diaName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            diaSemanalesEncontrado = diasSemanales.find(dia => 
              dia.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedName
            );
          }
          
          return diaSemanalesEncontrado ? diaSemanalesEncontrado.id : null;
        }).filter(id => id !== null);
        
        return result;
      };

      const diaIds = convertirDiasAIds(formData.dias_semanales);
      
      if (diaIds.length === 0) {
        toast.error("Error al seleccionar los días de la semana");
        return;
      }

      const servicioData = {
        receptor_id: selectedCuidador.id,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        descripcion: descripcion,
        horas_dia: formData.hora,
        dias_semanales_ids: diaIds,
      };

      await apiPost("/servicios/", servicioData);

      toast.success("Solicitud de servicio enviada correctamente");
      setSolicitudEnviada((prev) => ({ ...prev, [selectedCuidador.id]: true }));
      setModalOpen(false);
    } catch (error) {
      console.error("Error sending solicitud:", error);
      toast.error("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setModalLoading(false);
    }
  }, [filters, orden, provincia, ciudad, serviciosDisponibles]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle>Buscar Cuidadores</PageTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <FilterComponent
              serviciosDisponibles={serviciosDisponibles}
              provincias={provincias}
              ciudades={ciudades}
              filters={filters}
              provincia={provincia}
              ciudad={ciudad}
              onFilterChange={handleFilterChange}
              onEspecialidadChange={handleEspecialidadChange}
              onProvinciaChange={handleProvinciaChange}
              onCiudadChange={handleCiudadChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Mostrando {cuidadores.length} cuidadores
              </p>
              <Select value={orden} onValueChange={(v) => setOrden(v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-anios_experiencia">Más experiencia</SelectItem>
                  <SelectItem value="anios_experiencia">Menos experiencia</SelectItem>
                  <SelectItem value="usuario__first_name">Nombre A-Z</SelectItem>
                  <SelectItem value="-usuario__first_name">Nombre Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
                        <div className="flex gap-3">
                          <div className="h-10 bg-gray-300 rounded w-24"></div>
                          <div className="h-10 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cuidadores.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron cuidadores con los filtros seleccionados</p>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cuidadores.map((cuidador) => (
                  <CuidadorCard
                    key={cuidador.id}
                    cuidador={cuidador}
                    solicitudEnviada={solicitudEnviada[cuidador.id] || false}
                    onSolicitarServicio={() => openModal(cuidador)}
                  />
                ))}
              </div>
            )}
          </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    especialidad: [],
                    disponibilidad: "",
                    experiencia: "",
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
              Mostrando {cuidadores.length} de {cuidadoresMeta.count} cuidadores
            </p>
            <Select onValueChange={(v) => setOrden(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-rating">Mejor calificados</SelectItem>
                <SelectItem value="-anios_experiencia">Más experiencia</SelectItem>
                <SelectItem value="anios_experiencia">Menos experiencia</SelectItem>
                <SelectItem value="usuario__first_name">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="flex gap-3">
                        <div className="h-10 bg-gray-300 rounded w-24"></div>
                        <div className="h-10 bg-gray-300 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cuidadores.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cuidadores</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <>
              {cuidadores.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={c.foto_perfil || "/placeholder-user.jpg"}
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
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-2">
                            {c.especialidad.map((esp: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {esp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{c.descripcion}</p>
                        <div className="flex gap-3">
                          <Link href={`/cuidador/${c.id}`}>
                            <Button variant="outline">Ver Perfil</Button>
                          </Link>
                          <Button
                            variant={solicitudEnviada[c.id] ? "success" : "gradient"}
                            disabled={solicitudEnviada[c.id]}
                            onClick={() => openModal(c)}
                          >
                            {solicitudEnviada[c.id]
                              ? "Solicitud enviada"
                              : "Solicitar Servicio"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {cuidadoresMeta.hasNext && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => searchCuidadores(cuidadoresMeta.page + 1, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Cargando..." : "Cargar más"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <SolicitarServicioModal
          open={modalOpen}
          onClose={closeModal}
          cuidador={selectedCuidador}
          onSubmit={(formData) => handleSolicitud(formData, diasSemanales)}
          loading={modalLoading}
          diasSemanales={diasSemanales}
          horariosDiarios={horariosDiarios}
        />
      </div>
    </div>
  );
}