"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserContext } from "@/context/UserContext";


export default function Login() {
  // mantenemos los mismos dos campos del formulario
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { refreshUser, isAdmin } = useUserContext();
  // mostramos errores sin cambiar el diseño
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const next = useSearchParams().get("next") || "/";

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/auth/logout/", {
          method: "POST",
        });
        // Refresh user context to clear the user
        await refreshUser();
      } catch (error) {
        // Ignore logout errors - user might not be logged in
        console.log("Logout error (ignored):", error);
      }
    };
    logout();
  }, []);


  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // ⚠️ Enviamos lo que realmente se escribe en los inputs
    // Si tu backend acepta identifier/username/email, usamos identifier:
    const payload = { username: formData.email, password: formData.password };
    // Si usás SimpleJWT por defecto (username/password), cambia a:
    // const payload = { username: formData.email, password: formData.password };

    const r = await fetch("/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!r.ok) {
      const j = await r.json().catch(() => ({} as any));
      // extrae mensaje amigable sin cambiar el Alert del UI
      const msg =
        j.detail ||
        j.non_field_errors?.[0] ||
        j.identifier?.[0] ||
        j.username?.[0] ||
        j.email?.[0] ||
        j.password?.[0] ||
        "Error de autenticación";
      setError(msg);
      return;
    }

    const j = await r.json();
    localStorage.removeItem("token");
    await refreshUser();

    console.log("Usuario logueado:", j.user);
    console.log("es_cuidador:", j.user.es_cuidador);
    console.log("es_cliente:", j.user.es_cliente);
    console.log("is_staff:", j.user.is_staff);
    console.log("is_superuser:", j.user.is_superuser);

    let redirect = "/dashboard";
    if (j.user.es_cuidador) {
      redirect = "cuidador/dashboard";
    } else if (j.user.es_cliente) {
      redirect = "cliente/dashboard";
    } else if (j.user.is_staff || j.user.is_superuser) {
      redirect = "admin/";
    } else {
      // Fallback for users with no specific role
      redirect = "/";
    }

    router.push(redirect);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FindCare</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Bienvenido de vuelta</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                {/* etiqueta visual igual; solo corregimos id/for para accesibilidad */}
                <Label htmlFor="identifier">Email o Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/recuperar"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Registrarse
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Credenciales de prueba:
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Cliente: cliente@test.com / cliente</p>
                <p>Cuidador: cuidador@test.com / cuidador</p>
                <p>Admin: admin@test.com / admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
