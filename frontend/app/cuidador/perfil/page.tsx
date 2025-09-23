"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import CuidadorForm, { PerfilCuidador } from "@/components/ui/cuidadorForm";

export default function CuidadorPerfilPage() {
  const [perfil, setPerfil] = useState<PerfilCuidador | null>(null);
  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudadesPorProvincia, setCPP] = useState<Record<string, string[]>>({});
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await apiGet<PerfilCuidador>("/cuidador/perfil");
        // construir categorias_ids desde nombres si querés:
        setPerfil({ ...p, categorias_ids: [] });
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
        setCPP(map);
      } catch {
        // fallback mínimo si falla
        setProvincias(["Córdoba"]);
        setCPP({ Córdoba: ["Córdoba"] });
      }

      try {
        const tipos = await apiGet<{ id: number; nombre: string }[]>("/tipos-cliente");
        setCategorias(tipos);
      } catch {
        setCategorias([]);
      }
    })();
  }, []);

  const onSubmit = async (fd: FormData) => {
    try {
      await fetch("/api/b/cuidador/perfil/", {
        method: "PATCH",
        body: fd, // multipart
      });
      toast.success("Perfil actualizado");
      const p = await apiGet<PerfilCuidador>("/cuidador/perfil");
      setPerfil(p);
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <CuidadorForm
        perfil={perfil}
        setPerfil={(p) => setPerfil(p)}
        provincias={provincias}
        ciudadesPorProvincia={ciudadesPorProvincia}
        categoriasDisponibles={categorias}
        mode="edit"
        loading={loading}
        onSubmit={onSubmit}
        title="Editar Perfil"
      />
    </div>
  );
}
