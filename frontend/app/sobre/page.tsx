import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Clock, Award, CheckCircle, Star, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function SobreNosotros() {
  const stats = [
    { icon: Users, label: "Familias Atendidas", value: "1,200+" },
    { icon: Heart, label: "Cuidadores Verificados", value: "350+" },
    { icon: Clock, label: "Horas de Cuidado", value: "50,000+" },
    { icon: Star, label: "Calificación Promedio", value: "4.9/5" },
  ]

  const values = [
    {
      icon: Shield,
      title: "Confianza y Seguridad",
      description:
        "Todos nuestros cuidadores pasan por verificaciones exhaustivas de antecedentes y certificaciones profesionales.",
    },
    {
      icon: Heart,
      title: "Cuidado Personalizado",
      description:
        "Entendemos que cada persona tiene necesidades únicas. Conectamos familias con cuidadores especializados.",
    },
    {
      icon: Users,
      title: "Comunidad Comprometida",
      description:
        "Construimos una red de apoyo donde familias y cuidadores se conectan con confianza y respeto mutuo.",
    },
    {
      icon: Award,
      title: "Excelencia en Servicio",
      description: "Nos comprometemos a brindar la más alta calidad de servicio y apoyo continuo a nuestros usuarios.",
    },
  ]

  const team = [
    {
      name: "Dr. María Elena Rodríguez",
      role: "Fundadora y CEO",
      description: "Médica geriatra con 15 años de experiencia en cuidado de adultos mayores.",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Lic. Carlos Mendoza",
      role: "Director de Operaciones",
      description: "Especialista en gestión de servicios de salud y coordinación de cuidados.",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Lic. Ana Sofía Torres",
      role: "Directora de Calidad",
      description: "Enfermera especializada en supervisión y capacitación de personal de cuidado.",
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  const milestones = [
    {
      year: "2020",
      title: "Fundación de FindCare",
      description: "Iniciamos con la misión de conectar familias con cuidadores profesionales.",
    },
    {
      year: "2021",
      title: "Expansión Regional",
      description: "Ampliamos nuestros servicios a 5 provincias principales de Argentina.",
    },
    {
      year: "2022",
      title: "Certificación de Calidad",
      description: "Obtuvimos la certificación ISO 9001 para servicios de cuidado domiciliario.",
    },
    {
      year: "2023",
      title: "Plataforma Digital",
      description: "Lanzamos nuestra plataforma digital para facilitar la conexión y comunicación.",
    },
    {
      year: "2024",
      title: "1000+ Familias Atendidas",
      description: "Alcanzamos el hito de más de 1000 familias satisfechas con nuestros servicios.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">FindCare</span>
            </Link>

            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Inicio
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="text-gray-600 hover:text-blue-600">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sobre <span className="text-blue-600">FindCare</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Somos una plataforma dedicada a conectar familias con cuidadores profesionales, brindando tranquilidad y
            cuidado de calidad para tus seres queridos.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <stat.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-gray-600 mb-6">
                En FindCare, creemos que todos merecen recibir cuidado de calidad en la comodidad de su hogar.
                Nuestra misión es facilitar conexiones significativas entre familias que necesitan apoyo y cuidadores
                profesionales comprometidos con brindar el mejor servicio.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Trabajamos incansablemente para crear una comunidad de confianza donde el cuidado no es solo un
                servicio, sino una expresión de compasión y profesionalismo.
              </p>
              
            </div>
            <div className="relative">
              <img
                src="/about.png"
                alt="Cuidadora ayudando a una persona mayor"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los principios que guían nuestro trabajo y definen nuestra cultura organizacional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      



      {/* Contact Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">¿Tienes Preguntas?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Phone className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Teléfono</h3>
              <p className="text-blue-100">+54 3516655333</p>
              <p className="text-blue-100">Lun - Vie: 8:00 - 20:00</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-blue-100">info@FindCare.com</p>
              <p className="text-blue-100">soporte@FindCare.com</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Oficina</h3>
              <p className="text-blue-100">Av. Ituzaingo 1234</p>
              <p className="text-blue-100">Córdoba, Argentina</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/registro">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Únete a FindCare
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white ">

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FindCare. Todos los derechos reservados.</p>
          </div>
      </footer>
    </div>
  )
}
