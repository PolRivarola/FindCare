"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import SingleImageInput from "@/components/ui/inputPic";

type Exp = { descripcion: string; fecha_inicio: string; fecha_fin: string };
type CertLocal = { file: File; name?: string; url: string };

export type PerfilCuidador = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  descripcion: string;
  foto_perfil: string | null;
  provincia: string;
  ciudad: string;
  direccion: string;
  tipo_usuario: "cuidador";
  categorias: string[];        // nombres
  categorias_ids?: number[];   // para edición
  experiencias: Exp[];
  certificados: { name: string; file: string }[];
};

type Props = {
  perfil: PerfilCuidador | null;
  setPerfil: (p: PerfilCuidador) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  categoriasDisponibles: { id: number; nombre: string }[];
  loading: boolean;
  onSubmit: (fd: FormData) => Promise<void>;
  title?: string;
};

export default function CuidadorForm({
  perfil,
  setPerfil,
  provincias,
  ciudadesPorProvincia,
  categoriasDisponibles,
  loading,
  onSubmit,
  title,
}: Props) {
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [certLocal, setCertLocal] = useState<CertLocal[]>([]);

  const addExperiencia = () => {
    if (!perfil) return;
    setPerfil({
      ...perfil,
      experiencias: [...perfil.experiencias, { descripcion: "", fecha_inicio: "", fecha_fin: "" }],
    });
  };

  const updateExperiencia = (i: number, key: keyof Exp, value: string) => {
    if (!perfil) return;
    const arr = [...perfil.experiencias];
    (arr[i] as any)[key] = value;
    setPerfil({ ...perfil, experiencias: arr });
  };

  const removeExperiencia = (i: number) => {
    if (!perfil) return;
    const arr = [...perfil.experiencias];
    arr.splice(i, 1);
    setPerfil({ ...perfil, experiencias: arr });
  };

  const handleCertificados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setCertLocal((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeCertificado = (i: number) => {
    const arr = [...certLocal];
    arr.splice(i, 1);
    setCertLocal(arr);
  };

  const submit = async () => {
    if (!perfil) return;
    const fd = new FormData();
    // básicos
    fd.append("first_name", perfil.first_name || "");
    fd.append("last_name", perfil.last_name || "");
    fd.append("email", perfil.email || "");
    fd.append("telefono", perfil.telefono || "");
    if (perfil.fecha_nacimiento) fd.append("fecha_nacimiento", perfil.fecha_nacimiento);
    fd.append("descripcion", perfil.descripcion || "");

    // dirección
    fd.append("provincia", perfil.provincia || "");
    fd.append("ciudad", perfil.ciudad || "");
    fd.append("direccion", perfil.direccion || "");

    // foto
    if (fotoFile) fd.append("foto_perfil", fotoFile);

    // categorías -> ids
    const ids = perfil.categorias_ids || [];
    ids.forEach((id) => fd.append("categorias_ids", String(id)));

    // experiencias
    perfil.experiencias.forEach((e, idx) => {
      fd.append(`experiencias[${idx}][descripcion]`, e.descripcion || "");
      if (e.fecha_inicio) fd.append(`experiencias[${idx}][fecha_inicio]`, e.fecha_inicio);
      if (e.fecha_fin) fd.append(`experiencias[${idx}][fecha_fin]`, e.fecha_fin);
    });

    // certificados nuevos (solo agrega)
    certLocal.forEach((c, i) => {
      fd.append("certificados", c.file);
      fd.append("certificados_nombres", c.name || c.file.name);
    });

    await onSubmit(fd);
  };

  if (loading || !perfil) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SingleImageInput
          url={perfil.foto_perfil || ""}
          onChange={(file) => setFotoFile(file)}
        />
      </div>

      <Input value={perfil.first_name} onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })} placeholder="Nombre" />
      <Input value={perfil.last_name} onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })} placeholder="Apellido" />
      <Input value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} placeholder="Email" />
      <Input value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} placeholder="Teléfono" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Provincia</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={perfil.provincia}
            onChange={(e) => {
              const p = e.target.value;
              setPerfil({ ...perfil, provincia: p, ciudad: (ciudadesPorProvincia[p] || [])[0] || "" });
            }}
          >
            {provincias.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Ciudad</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={perfil.ciudad}
            onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })}
          >
            {(ciudadesPorProvincia[perfil.provincia] || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <Input value={perfil.direccion} onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })} placeholder="Dirección" />

      <Input
        type="date"
        value={perfil.fecha_nacimiento || ""}
        onChange={(e) => setPerfil({ ...perfil, fecha_nacimiento: e.target.value })}
        placeholder="Fecha de nacimiento"
      />

      <Textarea
        className="h-32"
        value={perfil.descripcion}
        onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
        placeholder="Descripción personal"
      />

      {/* Categorías -> ids */}
      <div>
        <label className="block font-medium mb-2">Categorías</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {categoriasDisponibles.map((cat) => {
            const active = (perfil.categorias || []).includes(cat.nombre);
            return (
              <Button
                key={cat.id}
                variant={active ? "default" : "outline"}
                onClick={() => {
                  const cur = new Set(perfil.categorias_ids || []);
                  if (active) cur.delete(cat.id); else cur.add(cat.id);
                  setPerfil({ ...perfil, categorias_ids: Array.from(cur) });
                }}
              >
                {cat.nombre}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Experiencia */}
      <div>
        <label className="block font-medium mb-2">Experiencia</label>
        {(perfil.experiencias || []).map((exp, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 mb-2">
            <Textarea
              value={exp.descripcion}
              placeholder="Descripción de la experiencia"
              onChange={(e) => updateExperiencia(i, "descripcion", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={exp.fecha_inicio?.slice(0,10) || ""} onChange={(e) => updateExperiencia(i, "fecha_inicio", e.target.value)} />
              <Input type="date" value={exp.fecha_fin?.slice(0,10) || ""} onChange={(e) => updateExperiencia(i, "fecha_fin", e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button variant="destructive" onClick={() => removeExperiencia(i)}>Eliminar</Button>
            </div>
          </div>
        ))}
        <Button variant="secondary" onClick={addExperiencia}>Agregar experiencia</Button>
      </div>

      {/* Certificados (nuevos) */}
      <div>
        <label className="block font-medium mb-2">Certificados</label>
        <label htmlFor="cert-upload" className="cursor-pointer bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white border-2 px-4 py-2 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium">
          Subir certificados
        </label>
        <input id="cert-upload" type="file" multiple onChange={handleCertificados} className="hidden" />

        <div className="mt-2 grid grid-cols-2 gap-4">
          {certLocal.map((c, i) => (
            <div key={i} className="bg-gray-100 p-2 rounded text-sm truncate flex justify-between items-center">
              <span className="text-gray-800">{c.file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeCertificado(i)}>Eliminar</Button>
            </div>
          ))}
        </div>

        {/* Certificados existentes (links) */}
        {perfil.certificados?.length ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {perfil.certificados.map((c, i) => (
              <a key={i} href={c.file} download className="text-blue-600 underline truncate">
                {c.name}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <Button className="mt-4" onClick={submit}>{title ? "Guardar cambios" : "Continuar"}</Button>
    </div>
  );
}
