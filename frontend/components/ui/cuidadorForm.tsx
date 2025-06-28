"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import SingleImageInput  from "@/components/ui/inputPic";

export interface CuidadorFormProps {
  perfil: any;
  setPerfil: (perfil: any) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  categoriasDisponibles: string[];
  loading: boolean;
  onSubmit: () => void;
  title?: string;
}

export default function CuidadorForm({
  perfil,
  setPerfil,
  provincias,
  ciudadesPorProvincia,
  categoriasDisponibles,
  loading,
  onSubmit,
  title,
}: CuidadorFormProps) {
  const addExperiencia = () => {
    setPerfil({
      ...perfil,
      experiencia: [...(perfil.experiencia || []), { descripcion: "", inicio: "", fin: "" }],
    });
  };

  const updateExperiencia = (index: number, key: string, value: string) => {
    const nuevas = [...(perfil.experiencia || [])];
    nuevas[index][key] = value;
    setPerfil({ ...perfil, experiencia: nuevas });
  };

  const removeExperiencia = (index: number) => {
    const nuevas = [...(perfil.experiencia || [])];
    nuevas.splice(index, 1);
    setPerfil({ ...perfil, experiencia: nuevas });
  };

  const handleCertificados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPerfil({ ...perfil, certificados: [...(perfil.certificados || []), ...previews] });
    e.target.value = "";
  };

  const removeCertificado = (index: number) => {
    const nuevos = [...(perfil.certificados || [])];
    nuevos.splice(index, 1);
    setPerfil({ ...perfil, certificados: nuevos });
  };

  return (
    <div className="space-y-4">
      {loading || !perfil ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            
<SingleImageInput
  url={perfil.foto_perfil}
  onChange={(file) => setPerfil({ ...perfil, fotoFile: file })}
/>
          </div>

          <Input
            value={perfil.first_name}
            onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })}
            placeholder="Nombre"
          />
          <Input
            value={perfil.last_name}
            onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })}
            placeholder="Apellido"
          />
          <Input
            value={perfil.email}
            onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
            placeholder="Email"
          />
          <Input
            value={perfil.telefono}
            onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
            placeholder="Teléfono"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Provincia</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={perfil.provincia}
                onChange={(e) => {
                  const nuevaProvincia = e.target.value;
                  setPerfil({
                    ...perfil,
                    provincia: nuevaProvincia,
                    ciudad: ciudadesPorProvincia[nuevaProvincia][0],
                  });
                }}
              >
                {provincias.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Ciudad</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={perfil.ciudad}
                onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })}
              >
                {ciudadesPorProvincia[perfil.provincia]?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            value={perfil.direccion}
            onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })}
            placeholder="Dirección"
          />
          <Input
            type="date"
            value={perfil.fecha_nacimiento}
            onChange={(e) => setPerfil({ ...perfil, fecha_nacimiento: e.target.value })}
            placeholder="Fecha de nacimiento"
          />
          <Textarea
            className="h-32"
            value={perfil.descripcion}
            onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
            placeholder="Descripción personal"
          />

          <div>
            <label className="block font-medium mb-2">Categorías</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categoriasDisponibles.map((categoria) => (
                <Button
                  key={categoria}
                  variant={perfil.categorias.includes(categoria) ? "default" : "outline"}
                  onClick={() => {
                    const nuevas =
                      perfil.categorias.includes(categoria)
                        ? perfil.categorias.filter((c: string) => c !== categoria)
                        : [...perfil.categorias, categoria];
                    setPerfil({ ...perfil, categorias: nuevas });
                  }}
                >
                  {categoria}
                </Button>
              ))}
            </div>
            <Input
              value={perfil.otros}
              onChange={(e) => setPerfil({ ...perfil, otros: e.target.value })}
              placeholder="Otros..."
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Experiencia</label>
            {(perfil.experiencia || []).map((exp: any, i: number) => (
              <div
                key={i}
                className="grid grid-cols-1 grid-rows-2  gap-2 mb-2 items-end"
              >
                <div><Textarea
                  className="md:col-span-2"
                  value={exp.descripcion}
                  placeholder="Descripción de la experiencia"
                  onChange={(e) => updateExperiencia(i, "descripcion", e.target.value)}
                /></div>
                <div className="grid grid-cols-2 grid-rows-1  gap-2 mb-2 items-end">
                  <div><Input
                  type="date"
                  value={exp.inicio}
                  className="mt-1 w-1/2"
                  onChange={(e) => updateExperiencia(i, "inicio", e.target.value)}
                />
                <Input
                className="mt-1 w-1/2"
                  type="date"
                  value={exp.fin}
                  onChange={(e) => updateExperiencia(i, "fin", e.target.value)}
                /></div>
                <div className="flex justify-end"><Button
                  variant="destructive"
                  className="mt-1 w-1/2 "
                  onClick={() => removeExperiencia(i)}
                >
                  Eliminar
                </Button></div>
                  
                
                </div>
                
                
              </div>
            ))}
            <Button variant="secondary" onClick={addExperiencia}>
              Agregar experiencia
            </Button>
          </div>

          <div>
            <label className="block font-medium mb-2">Certificados</label>
            <label
              htmlFor="cert-upload"
              className="cursor-pointer bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white border-2 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 "
            >
              Subir certificados
            </label>
            <input
              id="cert-upload"
              type="file"
              multiple
              onChange={handleCertificados}
              className="hidden"
            />
            <div className="mt-2 grid grid-cols-2 gap-4">
              {(perfil.certificados || []).map((c: any, i: number) => (
                <div
                  key={i}
                  className="bg-gray-100 p-2 rounded text-sm truncate flex justify-between items-center"
                >
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {c.file?.name || c.url.split("/").pop()}
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => removeCertificado(i)}>
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          </div>

            {/* Campos de contraseña */}
  <Input
    type="password"
    value={perfil.password || ""}
    onChange={(e) => setPerfil({ ...perfil, password: e.target.value })}
    placeholder="Contraseña"
  />
  <Input
    type="password"
    value={perfil.confirmPassword || ""}
    onChange={(e) => setPerfil({ ...perfil, confirmPassword: e.target.value })}
    placeholder="Repetir contraseña"
  />

          <Button className="mt-4" onClick={onSubmit}>
            {title ? 'Guardar cambios' : 'Continuar'}
          </Button>
        </>
      )}
    </div>
  );
}

