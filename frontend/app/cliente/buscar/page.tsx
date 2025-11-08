"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolicitarServicioModal } from "@/components/ui/SolicitarServicioModal";
import { FilterComponent } from "@/components/ui/FilterComponent";
import { CuidadorCard } from "@/components/ui/CuidadorCard";
import PageTitle from "@/components/ui/title";
import { useCuidadoresSearch } from "@/hooks/useCuidadoresSearch";
import { useServiceRequest } from "@/hooks/useServiceRequest";

export default function BuscarCuidadoresPage() {
  const [filters, setFilters] = useState({
    especialidad: [] as number[],
    experiencia: "",
  });
  const [orden, setOrden] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");

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
  };

  // Auto-search when filters change
  useEffect(() => {
    if (serviciosDisponibles.length > 0) {
      performSearch();
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
        </div>

        <SolicitarServicioModal
          open={modalOpen}
          onClose={closeModal}
          cuidador={selectedCuidador}
          onSubmit={(formData) => handleSolicitud(formData, diasSemanales)}
          loading={modalLoading}
          diasSemanales={diasSemanales}
          horariosDiarios={horariosDiarios}
          serviciosDisponibles={serviciosDisponibles}
        />
      </div>
    </div>
  );
}