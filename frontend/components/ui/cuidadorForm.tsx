"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import SingleImageInput from "@/components/ui/inputPic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  MapPin,
  User,
  FileText,
  Award,
  Briefcase,
  Upload,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";

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
  categorias: string[]; // nombres
  categorias_ids?: number[]; // para edición
  experiencias: Exp[];
  certificados: { nombre: string; archivo: string }[];
};

type Props = {
  perfil: PerfilCuidador | null;
  setPerfil: (p: PerfilCuidador) => void;
  provincias: string[];
  ciudadesPorProvincia: Record<string, string[]>;
  categoriasDisponibles: { id: number; nombre: string }[];
  loading: boolean;
  mode: "create" | "edit"; // 👈 nuevo
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
  mode,
  title,
}: Props) {
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [certLocal, setCertLocal] = useState<CertLocal[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const addExperiencia = () => {
    if (!perfil) return;
    setPerfil({
      ...perfil,
      experiencias: [
        ...perfil.experiencias,
        { descripcion: "", fecha_inicio: "", fecha_fin: "" },
      ],
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
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
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
    
    // Validación frontend de campos obligatorios
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
    if (!perfil.descripcion?.trim()) {
      toast.error("La descripción personal es obligatoria");
      return;
    }
    if (mode === "create" && (!password || !confirmPassword)) {
      toast.error("Completa la contraseña y su confirmación");
      return;
    }
  
    
    const fd = new FormData();
    // 1) Campos obligatorios - siempre se envían (ya validados arriba)
    fd.append("first_name", perfil.first_name);
    fd.append("last_name", perfil.last_name);
    fd.append("email", perfil.email);
    fd.append("telefono", perfil.telefono);
    fd.append("fecha_nacimiento", perfil.fecha_nacimiento);
    fd.append("descripcion", perfil.descripcion);
    fd.append("provincia", perfil.provincia);
    fd.append("ciudad", perfil.ciudad);
    
    // 2) Campos opcionales - solo si tienen valor
    const putOptional = (k: string, v: any) => {
      if (v !== undefined && v !== null && v !== "") {
        fd.append(k, String(v));
      }
    };
    putOptional("direccion", perfil.direccion);

    // 3) Foto de perfil
    if (fotoFile) fd.append("foto_perfil", fotoFile);

    const categoriasIds = categoriasDisponibles
      .filter((c) => new Set(perfil.categorias || []).has(c.nombre))
      .map((c) => c.id);

    if (categoriasIds.length) {
      fd.append("categorias_ids", JSON.stringify(categoriasIds));
    }

    if (mode === "create") {
      // Validación básica en front
      if (!password || !confirmPassword) {
        alert("Completa la contraseña y su confirmación");
        return;
      }
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      fd.append("password", password);
      fd.append("confirm_password", confirmPassword);
    }

    if (mode === "edit") {
      // Cambio de contraseña opcional
      const quiereCambiar =
        currentPassword || newPassword || confirmNewPassword;
      if (quiereCambiar) {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          alert("Para cambiar la contraseña completa los tres campos.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          alert("Las nuevas contraseñas no coinciden");
          return;
        }
        fd.append("current_password", currentPassword);
        fd.append("new_password", newPassword);
        fd.append("confirm_password", confirmNewPassword);
      }
    }

    // 5) Experiencias -> JSON string
    // Tu UI guarda { descripcion, fecha_inicio, fecha_fin }
    const exps = (perfil.experiencias || [])
      .filter((e: any) => e.descripcion && e.fecha_inicio && e.fecha_fin)
      .map((e: any) => ({
        descripcion: e.descripcion,
        // acepta 'YYYY-MM-DD' (el backend lo parsea)
        fecha_inicio: e.fecha_inicio,
        fecha_fin: e.fecha_fin,
      }));

    if (exps.length) {
      fd.append("experiencias", JSON.stringify(exps));
    }

    // 6) Certificados nuevos
    // Si estás usando un estado local: const [certLocal, setCertLocal] = useState<{file: File, name?: string}[]>([])
    // Tu UI muestra 'certLocal' —> aquí los enviamos:
    (certLocal || []).forEach((c) => {
      fd.append("certificados", c.file);
      // Nombre visible opcional para cada archivo
      fd.append("certificados_nombres", c.name || c.file.name);
    });

    
    await onSubmit(fd);
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          {title || "Perfil de Cuidador"}
        </h1>
        <p className="text-gray-600 text-lg">
          Completa tu información para ofrecer los mejores servicios de cuidado
        </p>
        <p className="text-sm text-gray-500">
          Los campos marcados con <span className="text-red-500">*</span> son obligatorios
        </p>
      </div>

      {/* Profile Photo Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-600" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="relative">
            <SingleImageInput
              url={perfil.foto_perfil || ""}
              onChange={(file) => setFotoFile(file)}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Upload className="h-4 w-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <User className="h-5 w-5 text-green-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={perfil.first_name}
                onChange={(e) =>
                  setPerfil({ ...perfil, first_name: e.target.value })
                }
                placeholder="Ingresa tu nombre"
                className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input
                value={perfil.last_name}
                onChange={(e) =>
                  setPerfil({ ...perfil, last_name: e.target.value })
                }
                placeholder="Ingresa tu apellido"
                className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                value={perfil.email}
                onChange={(e) =>
                  setPerfil({ ...perfil, email: e.target.value })
                }
                placeholder="tu@email.com"
                type="email"
                className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <Input
                value={perfil.telefono}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefono: e.target.value })
                }
                placeholder="+34 600 123 456"
                className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-600" />
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={perfil.fecha_nacimiento || ""}
              onChange={(e) =>
                setPerfil({ ...perfil, fecha_nacimiento: e.target.value })
              }
              className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Descripción Personal <span className="text-red-500">*</span>
            </label>
            <Textarea
              className="min-h-32 border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
              value={perfil.descripcion}
              onChange={(e) =>
                setPerfil({ ...perfil, descripcion: e.target.value })
              }
              placeholder="Cuéntanos sobre ti, tu experiencia y tu enfoque en el cuidado..."
            />
          </div>
          {mode === "create" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          {mode === "edit" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Cambiar contraseña (opcional)
              </p>
              <Input
                type="password"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Repetir nueva contraseña"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <MapPin className="h-5 w-5 text-blue-600" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Provincia <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-12 border-2 border-gray-200 rounded-md px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                value={perfil.provincia}
                onChange={(e) => {
                  const p = e.target.value;
                  setPerfil({
                    ...perfil,
                    provincia: p,
                    ciudad: (ciudadesPorProvincia[p] || [])[0] || "",
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-12 border-2 border-gray-200 rounded-md px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                value={perfil.ciudad}
                onChange={(e) =>
                  setPerfil({ ...perfil, ciudad: e.target.value })
                }
              >
                {(ciudadesPorProvincia[perfil.provincia] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Dirección
            </label>
            <Input
              value={perfil.direccion}
              onChange={(e) =>
                setPerfil({ ...perfil, direccion: e.target.value })
              }
              placeholder="Calle, número, piso..."
              className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Award className="h-5 w-5 text-purple-600" />
            Especialidades
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Selecciona las áreas en las que tienes experiencia
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {categoriasDisponibles.map((cat) => {
              const active = (perfil.categorias || []).includes(cat.nombre);
              return (
                <Badge
                  key={cat.id}
                  variant={active ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
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

      {/* Experience */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Briefcase className="h-5 w-5 text-orange-600" />
            Experiencia Profesional
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Añade tu experiencia laboral relevante
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {(perfil.experiencias || []).map((exp, i) => (
            <div
              key={i}
              className="relative bg-gray-50 rounded-lg p-6 border-2 border-gray-200"
            >
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperiencia(i)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 pr-12">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Descripción de la experiencia
                  </label>
                  <Textarea
                    value={exp.descripcion}
                    placeholder="Describe tu experiencia, responsabilidades y logros..."
                    onChange={(e) =>
                      updateExperiencia(i, "descripcion", e.target.value)
                    }
                    className="border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Fecha de inicio
                    </label>
                    <Input
                      type="date"
                      value={exp.fecha_inicio?.slice(0, 10) || ""}
                      onChange={(e) =>
                        updateExperiencia(i, "fecha_inicio", e.target.value)
                      }
                      className="h-12 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Fecha de fin
                    </label>
                    <Input
                      type="date"
                      value={exp.fecha_fin?.slice(0, 10) || ""}
                      onChange={(e) =>
                        updateExperiencia(i, "fecha_fin", e.target.value)
                      }
                      className="h-12 border-2 border-gray-200 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addExperiencia}
            className="w-full h-12 border-2 border-dashed border-orange-300 text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 bg-transparent"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Agregar experiencia
          </Button>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <FileText className="h-5 w-5 text-teal-600" />
            Certificados y Documentos
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Sube tus certificaciones y documentos relevantes
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="border-2 border-dashed border-teal-300 rounded-lg p-8 text-center bg-teal-50/50">
            <Upload className="h-12 w-12 text-teal-500 mx-auto mb-4" />
            <label
              htmlFor="cert-upload"
              className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="h-4 w-4" />
              Subir certificados
            </label>
            <input
              id="cert-upload"
              type="file"
              multiple
              onChange={handleCertificados}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-sm text-gray-500 mt-2">
              Formatos soportados: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>

          {/* New certificates */}
          {certLocal.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">
                Certificados nuevos:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certLocal.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white border-2 border-teal-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-teal-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate max-w-40">
                        {c.file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertificado(i)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing certificates */}
          {perfil.certificados?.length ? (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-semibold text-gray-700">
                Certificados existentes:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {perfil.certificados.map((c, i) => (
                  <a
                    key={i}
                    href={c.archivo} // ahora absoluto: http://127.0.0.1:8000/media/...
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate flex-1">
                      {c.nombre}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={submit}
          className="w-full md:w-auto px-12 py-4 text-lg font-semibold bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600  text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          {title ? "Guardar cambios" : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
