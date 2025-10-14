import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Conectamos familias con
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">cuidadores profesionales</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Encuentra el cuidado perfecto para tus seres queridos. Cuidadores verificados, disponibles 24/7 para el
            cuidado de personas mayores y con capacidades limitadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/registro">
              <Button size="lg" variant="gradient" className="text-lg px-8 py-3">
                Registrarse
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-600 text-lg px-8 py-3"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 border-purple-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cuidadores Verificados</h3>
              <p className="text-gray-600">Todos nuestros cuidadores pasan por un riguroso proceso de verificación</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-blue-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disponibilidad 24/7</h3>
              <p className="text-gray-600">Encuentra cuidadores disponibles en cualquier momento del día</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-purple-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad Confiable</h3>
              <p className="text-gray-600">Miles de familias confían en nuestra plataforma para el cuidado</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-purple-100 mb-6">Únete a nuestra comunidad y encuentra el cuidado que necesitas</p>
          <Link href="/registro">
            <Button size="lg" variant="outline">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 FindCare. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
