import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";

interface SearchFilters {
  especialidad: number[];
  experiencia: string;
}

interface SearchParams {
  filters: SearchFilters;
  orden: string;
  provincia: string;
  ciudad: string;
}

export function useCuidadoresSearch() {
  const [cuidadores, setCuidadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [diasSemanales, setDiasSemanales] = useState<any[]>([]);
  const [horariosDiarios, setHorariosDiarios] = useState<any[]>([]);

  const fetchInitialData = async () => {
    try {
      const [servicios, provinciasData, ciudadesData, diasData, horariosData] = await Promise.all([
        apiGet<any[]>("/tipos-cliente"),
        apiGet<any[]>("/provincias"),
        apiGet<any[]>("/ciudades"),
        apiGet<any[]>("/dias-semanales"),
        apiGet<any[]>("/horarios-diarios"),
      ]);

      setServiciosDisponibles(servicios);
      setProvincias(provinciasData);
      setCiudades(ciudadesData);
      setDiasSemanales(diasData);
      setHorariosDiarios(horariosData);
    } catch (error) {
      toast.error("Error al cargar datos iniciales");
    }
  };

  const searchCuidadores = async (params: SearchParams) => {
    try {
      setLoading(true);
      
      const searchParams: Record<string, any> = {
        ordering: params.orden || "-anios_experiencia",
      };

      // Filter by specialty (tipos_cliente) - backend expects 'especialidad' as array
      if (params.filters.especialidad.length > 0) {
        params.filters.especialidad.forEach(id => {
          if (!searchParams.especialidad) searchParams.especialidad = [];
          searchParams.especialidad.push(id);
        });
      }

      // Filter by minimum experience - backend expects 'min_experiencia'
      if (params.filters.experiencia) {
        searchParams.min_experiencia = params.filters.experiencia;
      }

      // Filter by provincia - backend expects provincia ID, not name
      if (params.provincia) {
        const provinciaObj = provincias.find(p => p.nombre === params.provincia);
        if (provinciaObj) {
          searchParams.provincia = provinciaObj.id;
        }
      }

      // Filter by ciudad - backend expects ciudad ID, not name
      if (params.ciudad) {
        const ciudadObj = ciudades.find(c => c.nombre === params.ciudad);
        if (ciudadObj) {
          searchParams.ciudad = ciudadObj.id;
        }
      }

      const data = await apiGet<any[]>("/search", searchParams);
      setCuidadores(data);
    } catch (error) {
      toast.error("Error al buscar cuidadores");
      setCuidadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return {
    cuidadores,
    loading,
    serviciosDisponibles,
    provincias,
    ciudades,
    diasSemanales,
    horariosDiarios,
    searchCuidadores,
  };
}
