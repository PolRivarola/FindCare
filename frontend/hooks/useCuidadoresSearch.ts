import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";

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

const PAGE_SIZE = 5;

export function useCuidadoresSearch() {
  const [cuidadores, setCuidadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [diasSemanales, setDiasSemanales] = useState<any[]>([]);
  const [horariosDiarios, setHorariosDiarios] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, hasNext: false, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const lastSearchParams = useRef<SearchParams | null>(null);

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

  const buildSearchParams = (params: SearchParams, page: number) => {
    const searchParams: Record<string, any> = {
      ordering: params.orden || "-anios_experiencia",
      page,
      page_size: PAGE_SIZE,
    };

    if (params.filters.especialidad.length > 0) {
      searchParams.especialidad = params.filters.especialidad;
    }

    if (params.filters.experiencia) {
      searchParams.min_experiencia = params.filters.experiencia;
    }

    if (params.provincia) {
      const provinciaObj = provincias.find((p) => p.nombre === params.provincia);
      if (provinciaObj) {
        searchParams.provincia = provinciaObj.id;
      }
    }

    if (params.ciudad) {
      const ciudadObj = ciudades.find((c) => c.nombre === params.ciudad);
      if (ciudadObj) {
        searchParams.ciudad = ciudadObj.id;
      }
    }

    return searchParams;
  };

  const searchCuidadores = async (params: SearchParams) => {
    lastSearchParams.current = params;
    try {
      setLoading(true);
      const searchParams = buildSearchParams(params, 1);
      const data = await apiGet<PaginatedResponse<any>>("/search", searchParams);
      setCuidadores(data.results);
      setPagination({ page: 1, hasNext: Boolean(data.next), total: data.count });
    } catch (error) {
      toast.error("Error al buscar cuidadores");
      setCuidadores([]);
      setPagination({ page: 1, hasNext: false, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCuidadores = async () => {
    if (!pagination.hasNext || loadingMore || !lastSearchParams.current) return;

    const nextPage = pagination.page + 1;
    setLoadingMore(true);
    try {
      const searchParams = buildSearchParams(lastSearchParams.current, nextPage);
      const data = await apiGet<PaginatedResponse<any>>("/search", searchParams);
      setCuidadores((prev) => [...prev, ...data.results]);
      setPagination({ page: nextPage, hasNext: Boolean(data.next), total: data.count });
    } catch (error) {
      toast.error("Error al cargar más cuidadores");
    } finally {
      setLoadingMore(false);
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
    total: pagination.total,
    hasMore: pagination.hasNext,
    loadingMore,
    searchCuidadores,
    loadMoreCuidadores,
  };
}
