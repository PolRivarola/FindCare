"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { apiPost } from "@/lib/api"

export default function ResetPassword() {
  const [step, setStep] = useState<"reset" | "success" | "error">("reset")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) {
      setStep("error")
      setError("Enlace de recuperación inválido o incompleto.")
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (!token || !email) {
      setError("Token o email faltante")
      setLoading(false)
      return
    }

    try {
      await apiPost("/api/auth/reset-password/", {
        token,
        email,
        new_password: password,
        confirm_password: confirmPassword,
      })
      setStep("success")
    } catch (err: any) {
      console.error("Error resetting password:", err)
      let errorMessage = "Error al restablecer la contraseña. El enlace puede haber expirado."
      try {
        const errorText = err.message || ""
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.non_field_errors?.[0] || errorMessage
      } catch {
        if (err.message && err.message.includes("detail")) {
          try {
            const parsed = JSON.parse(err.message)
            errorMessage = parsed.detail || errorMessage
          } catch {
            errorMessage = err.message
          }
        }
      }
      setError(errorMessage)
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enlace inválido</h3>
                <p className="text-gray-600 mb-6">
                  El enlace de recuperación es inválido o está incompleto. Por favor, solicita uno nuevo.
                </p>
                <Link href="/recuperar-contrasena">
                  <Button className="w-full">Solicitar nuevo enlace</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al login
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FindCare</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Restablecer Contraseña</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === "reset" && "Crea una nueva contraseña"}
              {step === "success" && "Contraseña restablecida"}
              {step === "error" && "Error al restablecer"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {step === "reset" && (
              <>
                <div className="text-center mb-6">
                  <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Ingresa una nueva contraseña para tu cuenta <strong>{email}</strong>
                  </p>
                </div>

                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                      className="mt-1"
                      minLength={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirma tu nueva contraseña"
                      className="mt-1"
                      minLength={8}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
                    {loading ? "Restableciendo..." : "Restablecer contraseña"}
                  </Button>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Contraseña restablecida!</h3>
                <p className="text-gray-600 mb-6">
                  Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>

                <Link href="/login" className="block">
                  <Button className="w-full">Ir al login</Button>
                </Link>
              </div>
            )}

            {step === "error" && (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al restablecer</h3>
                <p className="text-gray-600 mb-6">
                  {error || "El enlace puede haber expirado o ser inválido. Solicita uno nuevo."}
                </p>

                <div className="space-y-3">
                  <Link href="/recuperar-contrasena" className="block">
                    <Button className="w-full">Solicitar nuevo enlace</Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Volver al login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

