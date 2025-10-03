"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import SingleImageInput from "@/components/ui/inputPic";
import { MultiImagenUploader } from "@/components/ui/inputPicMulti";
import { PerfilCliente } from "@/lib/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, User, Images } from "lucide-react";
import ProfileInfoLocationCards from "@/components/ui/ProfileInfoLocationCards";

export type ClienteFormPerfil = PerfilCliente & {
  fotoFile?: File;
};

export interface ClienteFormProps {
  perfil: ClienteFormPerfil | null;
  setPerfil: (perfil: ClienteFormPerfil) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  categoriasDisponibles: { id: number; nombre: string }[];
  loading: boolean;
  onSubmit: (fd: FormData) => Promise<void>;
  mode?: "create" | "edit";
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
  mode = "edit",
  title,
}: ClienteFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSubmit = async () => {
    if (!perfil) return;

    // Validación de campos obligatorios
    if (!perfil.first_name?.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!perfil.last_name?.trim()) {
      toast.error("El apellido es obligatorio");
      return;
    }
    if (!perfil.email?.trim()) {
      toast.error("El email es obligatorio");
      return;
    }
    if (!perfil.telefono?.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }
    if (!perfil.fecha_nacimiento?.trim()) {
      toast.error("La fecha de nacimiento es obligatoria");
      return;
    }
    if (!perfil.provincia?.trim()) {
      toast.error("La provincia es obligatoria");
      return;
    }
    if (!perfil.ciudad?.trim()) {
      toast.error("La ciudad es obligatoria");
      return;
    }

    // Validación de contraseñas
    if (mode === "create") {
      if (!password || !confirmPassword) {
        toast.error("Completa la contraseña y su confirmación");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
    } else {
      const quiereCambiar = currentPassword || newPassword || confirmNewPassword;
      if (quiereCambiar) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          toast.error("Completa los tres campos de contraseña");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast.error("Las nuevas contraseñas no coinciden");
          return;
        }
      }
    }

    // Crear FormData
    const fd = new FormData();
    fd.append("first_name", perfil.first_name);
    fd.append("last_name", perfil.last_name);
    fd.append("email", perfil.email);
    fd.append("telefono", perfil.telefono);
    fd.append("fecha_nacimiento", perfil.fecha_nacimiento);
    fd.append("descripcion", perfil.descripcion);
    fd.append("provincia", perfil.provincia);
    fd.append("ciudad", perfil.ciudad);
    fd.append("direccion", perfil.direccion);

    if (perfil.fotoFile) {
      fd.append("foto_perfil", perfil.fotoFile);
    }

    fd.append("categorias", JSON.stringify(perfil.categorias || []));

    // Separate existing photos (strings) from new photos (Files)
    const fotosExistentes: string[] = [];
    const fotosNuevas: File[] = [];
    
    (perfil.fotos || []).forEach((item: any) => {
      if (item instanceof File) {
        fotosNuevas.push(item);
      } else if (typeof item === "string") {
        fotosExistentes.push(item);
      }
    });

    // Send list of existing photos to keep
    fd.append("fotos_existentes", JSON.stringify(fotosExistentes));

    // Send new photos to upload
    fotosNuevas.forEach((file) => {
      fd.append("fotos", file);
    });

    if (mode === "create") {
      fd.append("password", password);
      fd.append("confirm_password", confirmPassword);
    } else if (currentPassword && newPassword && confirmNewPassword) {
      fd.append("current_password", currentPassword);
      fd.append("new_password", newPassword);
      fd.append("confirm_password", confirmNewPassword);
    }

    setSubmitting(true);
    try {
      await onSubmit(fd);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !perfil) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        {mode === "create" && (
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Crear Perfil de Cliente
          </h1>
        )}
        <p className="text-gray-600 text-lg">Actualiza tu información para encontrar la mejor ayuda</p>
        <p className="text-sm text-gray-500">
          Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios
        </p>
      </div>

      {/* Profile Photo Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <User className="h-5 w-5 text-purple-600" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="relative">
            <SingleImageInput url={perfil.foto_perfil || ""} onChange={(file) => setPerfil({ ...perfil, fotoFile: file })} />
            
          </div>
        </CardContent>
      </Card>

      <ProfileInfoLocationCards perfil={perfil as any} setPerfil={setPerfil as any} provincias={provincias} ciudadesPorProvincia={ciudadesPorProvincia} showRequired={true} />

      {/* Additional Photos */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Images className="h-5 w-5 text-purple-600" />
            Fotos adicionales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <MultiImagenUploader urls={perfil.fotos} onChange={(items) => setPerfil({ ...perfil, fotos: items })} />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            Categorías de interés
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
          {categoriasDisponibles.map((cat) => {
              const active = (perfil.categorias || []).includes(cat.nombre);
              console.log(perfil);
              return (
                <Badge
                  key={cat.id}
                  variant={active ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                      : "border-2 border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50"
                  }`}
                  onClick={() => {
                    const cur = new Set(perfil.categorias || []);
                    if (active) cur.delete(cat.nombre);
                    else cur.add(cat.nombre);
                    setPerfil({ ...perfil, categorias: Array.from(cur) });
                  }}
                >
                  {cat.nombre}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Passwords */}
      {mode === "create" ? (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">Crear contraseña</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input type="password" placeholder="Repetir contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-xl text-gray-800">Cambiar contraseña (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="password" placeholder="Contraseña actual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Repetir nueva contraseña" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="gradient"
          className="w-full md:w-auto px-12 py-4 text-lg font-semibold"
        >
          {title ? "Guardar cambios" : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
