"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiGet, apiPatchFormData } from "@/lib/api";
import ClienteForm from "@/components/ui/clienteForm";
import { PerfilCliente } from "@/lib/types";
import PageTitle from "@/components/ui/title";


export default function PerfilClientePage() {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudadesPorProvincia, setCiudadesPorProvincia] = useState<Record<string, string[]>>({});
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<{ id: number; nombre: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const p = await apiGet<PerfilCliente>("/cliente/perfil");
        // construir categorias_ids desde nombres si querés:
        setPerfil({ ...p});
      } catch {
        toast.error("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }

      try {
        const provs = await apiGet<{ id: number; nombre: string }[]>(
          "/provincias"
        );
        setProvincias(provs.map((p) => p.nombre));

        // Ciudades
        const ciudades = await apiGet<
          {
            id: number;
            nombre: string;
            provincia: { id: number; nombre: string };
          }[]
        >("/ciudades");
        const map: Record<string, string[]> = {};
        ciudades.forEach((c) => {
          const provName = c.provincia?.nombre ?? "";
          if (!map[provName]) map[provName] = [];
          map[provName].push(c.nombre);
        });
        setCiudadesPorProvincia(map);
      } catch {
        // fallback mínimo si falla
        setProvincias(["Córdoba"]);
        setCiudadesPorProvincia({ Córdoba: ["Córdoba"] });
      }

      try {
        const tipos = await apiGet<{ id: number; nombre: string }[]>("/tipos-cliente");
        setCategoriasDisponibles(tipos);
      } catch {
        setCategoriasDisponibles([]);
      }
    })();
  }, []);


  const handleSubmit = async (fd: FormData) => {
    try {
      await apiPatchFormData("/cliente/perfil", fd);
      toast.success("Perfil actualizado con éxito");
      const p = await apiGet<PerfilCliente>("/cliente/perfil");
      setPerfil(p);
    } catch {
      toast.error("Error al actualizar el perfil");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <PageTitle>Mi Perfil</PageTitle>
      <ClienteForm
        perfil={perfil}
        setPerfil={setPerfil}
        provincias={provincias}
        ciudadesPorProvincia={ciudadesPorProvincia}
        categoriasDisponibles={categoriasDisponibles}
        loading={loading}
        onSubmit={handleSubmit}
        title="Mi Perfil"
      />
    </div>
  );
}
