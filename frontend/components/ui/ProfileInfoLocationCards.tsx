"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, User } from "lucide-react";
import React from "react";

type PerfilCommon = {
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  descripcion: string;
  provincia: string;
  ciudad: string;
  direccion: string;
};

type Props = {
  perfil: PerfilCommon;
  setPerfil: (p: PerfilCommon) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  showRequired?: boolean;
};

export default function ProfileInfoLocationCards({ perfil, setPerfil, provincias, ciudadesPorProvincia, showRequired = false }: Props) {
  return (
    <>
      {/* Información Personal */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <User className="h-5 w-5 text-purple-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Nombre
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <Input value={perfil.first_name} onChange={(e) => setPerfil({ ...perfil, first_name: e.target.value })} placeholder="Ingresa tu nombre" className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Apellido
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <Input value={perfil.last_name} onChange={(e) => setPerfil({ ...perfil, last_name: e.target.value })} placeholder="Ingresa tu apellido" className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Email
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <Input value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} type="email" placeholder="tu@email.com" className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Teléfono
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <Input value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} placeholder="+34 600 123 456" className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-600" />
              Fecha de Nacimiento
              {showRequired && <span className="text-red-500 font-bold">*</span>}
            </label>
            <Input type="date" value={perfil.fecha_nacimiento || ""} onChange={(e) => setPerfil({ ...perfil, fecha_nacimiento: e.target.value })} className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
          </div>

          <div className="space-y-2"> 
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Descripción Personal
              {showRequired && <span className="text-red-500 font-bold">*</span>}
            </label>
            <Textarea value={perfil.descripcion} onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })} className="min-h-32 border-2 border-gray-200 focus:border-purple-500 transition-colors resize-none" placeholder="Cuéntanos sobre ti..." />
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <MapPin className="h-5 w-5 text-purple-600" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Provincia
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <select className="w-full h-12 border-2 border-gray-200 rounded-md px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors bg-white" value={perfil.provincia} onChange={(e) => {
                const p = e.target.value;
                setPerfil({ ...perfil, provincia: p, ciudad: (ciudadesPorProvincia[p] || [""])[0] || "" });
              }}>
                {provincias.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Ciudad
                {showRequired && <span className="text-red-500 font-bold">*</span>}
              </label>
              <select className="w-full h-12 border-2 border-gray-200 rounded-md px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors bg-white" value={perfil.ciudad} onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })}>
                {(ciudadesPorProvincia[perfil.provincia] || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Dirección</label>
            <Input value={perfil.direccion} onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })} placeholder="Calle, número, piso..." className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}


