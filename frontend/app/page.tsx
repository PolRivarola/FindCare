import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Conectamos familias con
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">cuidadores profesionales</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
            Encuentra el cuidado perfecto para tus seres queridos. Atención hecha a tu medida, disponible 24/7 para el
             personas mayores y con capacidades limitadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-16 px-4">
            <Link href="/registro" className="w-full sm:w-auto">
              <Button size="lg" variant="gradient" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3">
                Registrarse
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-600 text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <Card className="text-center p-4 md:p-6 border-purple-100 flex justify-center align-middle">
            <CardContent className="pt-4 md:pt-6 flex justify-center flex-col">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold ">Transparencia y Seguridad</h3>
            </CardContent>
          </Card>

          <Card className="text-center p-4 md:p-6 border-blue-100 flex justify-center align-middle ">
            <CardContent className="pt-4 md:pt-6 flex justify-center flex-col">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Clock className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Disponibilidad 24/7</h3>
            </CardContent>
          </Card>

          <Card className="text-center p-4 md:p-6 border-purple-100 flex justify-center align-middle">
            <CardContent className="pt-4 md:pt-6 flex justify-center flex-col">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Comunidad Confiable</h3>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">¿Listo para comenzar?</h2>
          <p className="text-purple-100 mb-4 md:mb-6 text-sm md:text-base">Únete a nuestra comunidad y encuentra el cuidado que necesitas</p>
          <Link href="/registro">
            <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3">
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
