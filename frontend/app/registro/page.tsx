"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import CuidadorForm, { type PerfilCuidador } from "@/components/ui/cuidadorForm";
import ClienteForm, { type ClienteFormPerfil } from "@/components/ui/clienteForm";
import { apiGet, apiPost, apiPostFormData } from "@/lib/api";

type Categoria = { id: number; nombre: string };

export default function Registro() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<"cliente" | "cuidador" | "">("");

  // ======= catálogos =======
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudadesPorProvincia, setCiudadesPorProvincia] = useState<Record<string, string[]>>({});
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCatalogos(true);

        // Provincias
        const provs = await apiGet<{ id: number; nombre: string }[]>("/provincias");
        setProvincias(provs.map((p) => p.nombre));

        // Ciudades
        const ciudades = await apiGet<{ id: number; nombre: string; provincia: { id: number; nombre: string } }[]>(
          "/ciudades"
        );
        const map: Record<string, string[]> = {};
        ciudades.forEach((c) => {
          const provName = c.provincia?.nombre ?? "";
          if (!map[provName]) map[provName] = [];
          map[provName].push(c.nombre);
        });
        setCiudadesPorProvincia(map);

        // Categorías / Tipos de cliente
        const cats = await apiGet<Categoria[]>("/tipos-cliente");
        setCategoriasDisponibles(cats);
      } catch (e) {
        toast.error("No se pudieron cargar los catálogos.");
        setProvincias([]);
        setCiudadesPorProvincia({});
        setCategoriasDisponibles([]);
      } finally {
        setLoadingCatalogos(false);
      }
    })();
  }, []);

  // ======= estados de formularios =======
  const [cuidadorData, setCuidadorData] = useState<PerfilCuidador>({
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    descripcion: "",
    foto_perfil: "",
    categorias: [], // nombres seleccionados por UI
    provincia: "",
    ciudad: "",
    experiencias: [],
    certificados: [],
    tipo_usuario: "cuidador",
  });

  const [clienteData, setClienteData] = useState<ClienteFormPerfil>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    descripcion: "",
    foto_perfil: "",
    fotoFile: undefined,
    fotos: [],
    categorias: [], // según tu UI de cliente
    provincia: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  });

  // ======= handlers submit =======
  // CuidadorForm nos llama con un FormData ya armado (foto, experiencias JSON, certificados, categorias_ids, etc.)
  const handleRegistroCuidador = async (fd: FormData) => {
    try {
      await apiPostFormData('/cuidador/perfil/', fd);

      toast.success("Registro exitoso. ¡Ya puedes iniciar sesión!");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message || "Error registrando cuidador.");
    }


  };

  // Ajusta esto a tu endpoint de registro de cliente (en tu backend tenías rutas /api/registro/cliente)
  const handleRegistroCliente = async () => {
    try {
      const fd = new FormData();
      // campos básicos
      fd.append("first_name", clienteData.first_name || "");
      fd.append("last_name", clienteData.last_name || "");
      fd.append("email", clienteData.email || "");
      fd.append("telefono", clienteData.telefono || "");
      if (clienteData.fecha_nacimiento) fd.append("fecha_nacimiento", clienteData.fecha_nacimiento);
      fd.append("descripcion", clienteData.descripcion || "");
      if (clienteData.fotoFile) fd.append("foto_perfil", clienteData.fotoFile);

      // dirección
      fd.append("provincia", clienteData.provincia || "");
      fd.append("ciudad", clienteData.ciudad || "");
      fd.append("direccion", clienteData.direccion || "");

      // contraseña
      if (!clienteData.password || !clienteData.confirmPassword) {
        toast.error("Completa contraseña y su confirmación");
        return;
      }
      if (clienteData.password !== clienteData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      fd.append("password", clienteData.password);
      fd.append("confirm_password", clienteData.confirmPassword);

      // si usas categorías para cliente por nombre -> conviértelas a ids si tu API las requiere
      // (aquí las dejo como nombres por si tu endpoint las acepta como tal)
      clienteData.categorias.forEach((n) => fd.append("categorias", n));

      const res = await fetch("/api/b/registro/cliente", { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg?.detail || "No se pudo registrar el cliente.");
      }
      toast.success("Registro exitoso. ¡Ya puedes iniciar sesión!");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message || "Error registrando cliente.");
    }
  };

  // ======= render =======
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/" className="flex items-center text-blue-600 mb-4">
          <ArrowLeft className="mr-2" /> Volver
        </Link>

        <div className="text-center mb-8">
          <Heart className="inline-block mr-2 text-blue-600" />
          <h1 className="inline text-3xl font-bold">Registro de Usuario</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Paso {step} de 2</CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">
                  ¿Cómo quieres usar la plataforma?
                </h2>
                <RadioGroup value={userType} onValueChange={(v) => setUserType(v as any)} className="space-y-3">
                  <Label
                    htmlFor="cliente"
                    className={`p-4 border rounded cursor-pointer flex items-center gap-2 ${
                      userType === "cliente" ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <RadioGroupItem value="cliente" id="cliente" />
                    Cliente
                  </Label>
                  <Label
                    htmlFor="cuidador"
                    className={`p-4 border rounded cursor-pointer flex items-center gap-2 ${
                      userType === "cuidador" ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <RadioGroupItem value="cuidador" id="cuidador" />
                    Cuidador
                  </Label>
                </RadioGroup>
                <Button onClick={() => setStep(2)} disabled={!userType} className="w-full mt-4">
                  Continuar <ArrowRight className="inline ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Datos de {userType === "cliente" ? "Cliente" : "Cuidador"}
                </h2>

                {userType === "cliente" ? (
                  <ClienteForm
                    perfil={clienteData}
                    setPerfil={setClienteData}
                    provincias={provincias}
                    ciudadesPorProvincia={ciudadesPorProvincia}
                    categoriasDisponibles={
                      // si tu ClienteForm espera string[], convierto:
                      categoriasDisponibles.map((c) => c.nombre)
                    }
                    loading={loadingCatalogos}
                    onSubmit={handleRegistroCliente}
                    title="Registro Cliente"
                  />
                ) : (
                  <CuidadorForm
                    perfil={cuidadorData}
                    setPerfil={(p) => setCuidadorData(p)}
                    provincias={provincias}
                    ciudadesPorProvincia={ciudadesPorProvincia}
                    categoriasDisponibles={categoriasDisponibles} // {id, nombre}[]
                    loading={loadingCatalogos}
                    onSubmit={handleRegistroCuidador} // recibe FormData
                    mode="create" // 👈 registro SIEMPRE create
                    title="Registro Cuidador"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
