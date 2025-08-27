"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/api";
import ClienteForm from "@/components/ui/clienteForm";
import { PerfilCliente } from "@/lib/types";
import PageTitle from "@/components/ui/title";

const categoriasDisponibles = [
  "Edad avanzada",
  "Discapacidad motriz",
  "Discapacidad intelectual",
  "Enfermedades crónicas",
  "Recuperación postoperatoria",
];

export default function PerfilClientePage() {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudadesPorProvincia, setCiudadesPorProvincia] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<PerfilCliente>("/cliente/perfil/"),
      apiGet<Record<string, string[]>>("/ubicaciones/"),
    ])
      .then(([perfilData, ubicaciones]) => {
        setPerfil(perfilData);
        setProvincias(Object.keys(ubicaciones));
        setCiudadesPorProvincia(ubicaciones);
        setLoading(false);
      })
      .catch(() => {
        toast.error("No se pudo cargar el perfil o las ubicaciones");
        
        setPerfil({
          username: "juanperez",
          first_name: "Juan",
          last_name: "Pérez",
          email: "juan.perez@example.com",
          telefono: "123456789",
          direccion: "Calle Falsa 123",
          fecha_nacimiento: "1970-01-01",
          descripcion: "Perfil de cliente de ejemplo (offline).",
          foto_perfil: "/placeholder.jpg",
          fotos: ["/placeholder.jpg"],
          categorias: [categoriasDisponibles[0]],
          provincia: provincias[0] || "",
          ciudad: ciudadesPorProvincia[provincias[0]]?.[0] || "",
          password: "",
          confirmPassword: "",
        });
        setProvincias(["Buenos Aires", "Córdoba", "Santa Fe"]);
        setCiudadesPorProvincia({
          "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
          "Córdoba": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
          "Santa Fe": ["Santa Fe", "Rosario", "Rafaela"],
        });
        setLoading(false);
      });
  }, []);


  const handleSubmit = () => {
    if (!perfil) return;
    const formData = new FormData();
    formData.append("first_name", perfil.first_name);
    formData.append("last_name", perfil.last_name);
    formData.append("email", perfil.email);
    formData.append("telefono", perfil.telefono);
    formData.append("direccion", perfil.direccion);
    formData.append("fecha_nacimiento", perfil.fecha_nacimiento);
    formData.append("descripcion", perfil.descripcion);
    formData.append("provincia", perfil.provincia);
    formData.append("ciudad", perfil.ciudad);
    if ((perfil as any).fotoFile instanceof File) {
      formData.append("foto_perfil", (perfil as any).fotoFile);
    }
    perfil.fotos.forEach((item: any) => {
      if (item instanceof File) {
        formData.append("fotos", item);
      } else {
        formData.append("fotos_urls", item);
      }
    });
    formData.append("categorias", JSON.stringify(perfil.categorias));

    apiPut("/cliente/perfil", formData)
      .then(() => toast.success("Perfil actualizado con éxito"))
      .catch(() => toast.error("Error al actualizar el perfil"));
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
