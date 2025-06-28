"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/api";
import Image from "next/image";
import FotoPerfilInput from "@/components/ui/inputPic";
import PageTitle from "@/components/ui/title";
import CuidadorForm from "@/components/ui/cuidadorForm";

const categoriasDisponibles = [
  "Edad avanzada",
  "Discapacidad motriz",
  "Discapacidad intelectual",
  "Enfermedades crónicas",
  "Recuperación postoperatoria",
];

export default function PerfilCuidadorPage() {
  const [perfil, setPerfil] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudadesPorProvincia, setCiudadesPorProvincia] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<any>("/cuidador/perfil"),
      apiGet<Record<string, string[]>>("/ubicaciones")
    ])
      .then(([perfilData, ubicaciones]) => {
        setPerfil({
          ...perfilData,
          experiencia: perfilData.experiencia || [],
          certificados: perfilData.certificados || [],
          otros: perfilData.otros || ""
        });
        setProvincias(Object.keys(ubicaciones));
        setCiudadesPorProvincia(ubicaciones);
        setLoading(false);
      })
      .catch(() => {
        toast.error("No se pudo cargar el perfil o las ubicaciones");
        setPerfil({
          username: "ana24",
          email: "ana@email.com",
          first_name: "Ana",
          last_name: "Gómez",
          telefono: "3511234567",
          direccion: "Calle Falsa 123",
          fecha_nacimiento: "1990-01-01",
          descripcion: "Tengo 5 años de experiencia cuidando personas mayores.",
          foto_perfil: "/placeholder.jpg",
          categorias: ["Edad avanzada"],
          provincia: "Córdoba",
          ciudad: "Córdoba Capital",
          experiencia: [],
          certificados: [],
          otros: "",
          password: "",
          confirmPassword: "",
        });
        setProvincias(["Buenos Aires", "Córdoba", "Santa Fe"]);
        setCiudadesPorProvincia({
          "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
          "Córdoba": ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto"],
          "Santa Fe": ["Santa Fe", "Rosario", "Rafaela"]
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    if (!perfil) return;
    apiPut("/cuidador/perfil", perfil)
      .then(() => toast.success("Perfil actualizado con éxito"))
      .catch(() => toast.error("Error al actualizar el perfil"));
  };

  const addExperiencia = () => {
    setPerfil({
      ...perfil,
      experiencia: [...perfil.experiencia, { descripcion: "", inicio: "", fin: "" }]
    });
  };

  const updateExperiencia = (index: number, key: string, value: string) => {
    const nuevas = [...perfil.experiencia];
    nuevas[index][key] = value;
    setPerfil({ ...perfil, experiencia: nuevas });
  };

  const removeExperiencia = (index: number) => {
    const nuevas = [...perfil.experiencia];
    nuevas.splice(index, 1);
    setPerfil({ ...perfil, experiencia: nuevas });
  };

  const handleCertificados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPerfil({ ...perfil, certificados: [...perfil.certificados, ...previews] });
    e.target.value = "";
  };

  const removeCertificado = (index: number) => {
    const nuevos = [...perfil.certificados];
    nuevos.splice(index, 1);
    setPerfil({ ...perfil, certificados: nuevos });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <PageTitle>Mi Perfil</PageTitle>
      {loading || !perfil ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : (
        <CuidadorForm
  perfil={perfil}
  setPerfil={setPerfil}
  provincias={provincias}
  ciudadesPorProvincia={ciudadesPorProvincia}
  categoriasDisponibles={categoriasDisponibles}
  loading={loading}
  onSubmit={handleSubmit}
  title="Mi Perfil"
/>
      )}
    </div>
  );
}
