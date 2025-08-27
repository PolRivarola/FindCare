"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { apiPost } from "@/lib/api"

export default function RecuperarPassword() {
  const [step, setStep] = useState<"email" | "success" | "error">("email")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido")
      setLoading(false)
    } else {
      try {
        await apiPost("/api/auth/recover-password/", { email })
        setStep("success")
      } catch (err) {
        console.error("Error sending recovery email:", err)
        setError("Error al enviar el email de recuperación. Intenta nuevamente.")
        setStep("error")
      }finally{
    setLoading(false)}
      
    }
    
  }

  const handleRetry = () => {
    setStep("email")
    setError("")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al login
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FindCare</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === "email" && "Ingresa tu email"}
              {step === "success" && "Email enviado"}
              {step === "error" && "Error al enviar"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {step === "email" && (
              <>
                <div className="text-center mb-6">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña.
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    ¿Recordaste tu contraseña?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Iniciar Sesión
                    </Link>
                  </p>
                </div>
              </>
            )}

            {step === "success" && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Email enviado!</h3>
                <p className="text-gray-600 mb-6">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada y
                  sigue las instrucciones para restablecer tu contraseña.
                </p>

                <div className="space-y-3">
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    Enviar a otro email
                  </Button>
                  <Link href="/login" className="block">
                    <Button className="w-full">Volver al login</Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>¿No recibiste el email?</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Revisa tu carpeta de spam o correo no deseado</li>
                    <li>• Verifica que el email esté escrito correctamente</li>
                    <li>• El enlace expira en 24 horas</li>
                  </ul>
                </div>
              </div>
            )}

            {step === "error" && (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al enviar</h3>
                <p className="text-gray-600 mb-6">No pudimos enviar el email de recuperación. Esto puede deberse a:</p>

                <div className="text-left mb-6 p-4 bg-red-50 rounded-lg">
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• El email no está registrado en nuestro sistema</li>
                    <li>• Problemas temporales del servidor</li>
                    <li>• Conexión a internet inestable</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleRetry} className="w-full">
                    Intentar nuevamente
                  </Button>
                  <Link href="/registro" className="block">
                    <Button variant="outline" className="w-full">
                      Crear nueva cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        
      </div>
    </div>
  )
}
