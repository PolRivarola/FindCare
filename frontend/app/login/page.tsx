"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { apiPost } from "@/lib/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (process.env.NODE_ENV === "development") {
      await new Promise((res) => setTimeout(res, 1000));
      if (
        formData.email === "cliente@test.com" &&
        formData.password === "cliente"
      ) {
        window.location.href = "cliente/dashboard";
      } else {
        setError("Email o contraseña incorrectos");
      }
      return;
    }
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiPost<{ rol: string }>("/auth/login/", formData);

      if (data.rol === "admin") {
        window.location.href = "/admin";
      } else if (data.rol === "cliente") {
        window.location.href = "/cliente-dashboard";
      } else if (data.rol === "cuidador") {
        window.location.href = "/cuidador-dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Error del sistema. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

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
            <span className="text-2xl font-bold text-gray-900">
              FindCare
            </span>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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
