"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import SingleImageInput from "@/components/ui/inputPic";
import { MultiImagenUploader } from "@/components/ui/inputPicMulti";
import { PerfilCliente } from "@/lib/types";

export type ClienteFormPerfil = PerfilCliente & {
  fotoFile?: File;
};

export interface ClienteFormProps {
  perfil: ClienteFormPerfil | null;
  setPerfil: (perfil: ClienteFormPerfil) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  categoriasDisponibles: string[];
  loading: boolean;
  onSubmit: () => void;
  title?: string;
}

export default function ClienteForm({
  perfil,
  setPerfil,
  provincias,
  ciudadesPorProvincia,
  categoriasDisponibles,
  loading,
  onSubmit,
  title,
}: ClienteFormProps) {
  if (loading || !perfil) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        
        <SingleImageInput
          url={perfil.foto_perfil}
          onChange={(file: File) => setPerfil({ ...perfil, fotoFile: file })}
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
              const nueva = e.target.value;
              setPerfil({
                ...perfil,
                provincia: nueva,
                ciudad: ciudadesPorProvincia[nueva][0],
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
        value={perfil.descripcion}
        onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
        placeholder="Descripción personal"
      />

      <div>
        <label className="block font-medium mb-1">Fotos adicionales</label>
        <MultiImagenUploader
        urls={perfil.fotos}
        onChange={(items) => setPerfil({ ...perfil, fotos: items })}
      />
      </div>

      <div>
        <label className="block font-medium mb-1">Categorías</label>
        <div className="flex flex-wrap gap-2">
          {categoriasDisponibles.map((cat) => (
            <Button
              key={cat}
              variant={perfil.categorias.includes(cat) ? "default" : "outline"}
              onClick={() => {
                const nuevas = perfil.categorias.includes(cat)
                  ? perfil.categorias.filter((c) => c !== cat)
                  : [...perfil.categorias, cat];
                setPerfil({ ...perfil, categorias: nuevas });
              }}
            >
              {cat}
            </Button>
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
        {title || "Guardar cambios"}
      </Button>
    </div>
  );
}
