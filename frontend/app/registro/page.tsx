"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import CuidadorForm from "@/components/ui/cuidadorForm";
import ClienteForm, { ClienteFormPerfil } from "@/components/ui/clienteForm";

export default function Registro() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"cliente" | "cuidador" | "">("");

  const [cuidadorData, setCuidadorData] = useState<any>({
    /* inicial */
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
    categorias: [],
    provincia: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
  });
  const provincias: string[] = [];
  const ciudadesPorProvincia: Record<string, string[]> = {};
  const categoriasDisponibles: string[] = [];
  const loading = false;

  const handleRegistro = () => {
    if (userType === "cuidador") {
      console.log("Registrar cuidador:", cuidadorData);
    } else if (userType === "cliente") {
      console.log("Registrar cliente:", clienteData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
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
                <RadioGroup
                  value={userType}
                  onValueChange={(v) => setUserType(v as any)}
                  className="space-y-3"
                >
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
                <Button
                  onClick={() => setStep(2)}
                  disabled={!userType}
                  className="w-full mt-4"
                >
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
                    categoriasDisponibles={categoriasDisponibles}
                    loading={loading}
                    onSubmit={handleRegistro}
                    title="Registro Cliente"
                  />
                ) : (
                  <CuidadorForm
                    perfil={cuidadorData}
                    setPerfil={setCuidadorData}
                    provincias={provincias}
                    ciudadesPorProvincia={ciudadesPorProvincia}
                    categoriasDisponibles={categoriasDisponibles}
                    loading={loading}
                    onSubmit={handleRegistro}
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
