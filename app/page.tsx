import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Users, Palette, Lock, Sparkles } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 px-3 py-1 bg-purple-100 text-purple-800 border-purple-200">
            ¡Nueva versión disponible!
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Murales Colaborativos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Crea, comparte y colabora en murales interactivos para educación, trabajo en equipo y mucho más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button className="text-lg px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            Todo lo que necesitas para colaborar visualmente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Palette className="h-10 w-10 text-pink-500" />}
              title="Diseño intuitivo"
              description="Interfaz fácil de usar que permite crear murales visualmente atractivos sin conocimientos técnicos."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-500" />}
              title="Colaboración en tiempo real"
              description="Trabaja con tu equipo simultáneamente en el mismo mural, viendo los cambios al instante."
            />
            <FeatureCard
              icon={<Lock className="h-10 w-10 text-blue-500" />}
              title="Control de permisos"
              description="Decide quién puede ver, editar o comentar en tus murales con un sistema de permisos flexible."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-amber-500" />}
              title="Contenido multimedia"
              description="Añade textos, imágenes, videos, enlaces y archivos para crear murales interactivos y completos."
            />
            <FeatureCard
              icon={<DeviceIcon className="h-10 w-10 text-green-500" />}
              title="Acceso multiplataforma"
              description="Accede a tus murales desde cualquier dispositivo, en cualquier momento y lugar."
            />
            <FeatureCard
              icon={<TemplateIcon className="h-10 w-10 text-indigo-500" />}
              title="Plantillas personalizables"
              description="Comienza rápidamente con plantillas prediseñadas para diferentes casos de uso."
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                Visualiza tus ideas como nunca antes
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                MuralApp te permite organizar tus ideas de forma visual y colaborativa. Perfecto para lluvia de ideas,
                planificación de proyectos, enseñanza y mucho más.
              </p>
              <ul className="space-y-4 mb-8">
                <CheckItem text="Organiza información de forma visual e intuitiva" />
                <CheckItem text="Facilita la colaboración y el trabajo en equipo" />
                <CheckItem text="Mejora la participación en entornos educativos" />
                <CheckItem text="Comparte fácilmente tus creaciones" />
              </ul>
              <Link href="/registro">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  Comenzar ahora
                </Button>
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-purple-100">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Demo de MuralApp"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 border border-purple-100">
                <Badge className="bg-green-500">Nuevo</Badge>
                <p className="font-medium mt-1">¡Colaboración en tiempo real!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
            Lo que dicen nuestros usuarios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="MuralApp ha transformado la forma en que enseño. Mis estudiantes están más comprometidos que nunca."
              author="María Rodríguez"
              role="Profesora de Secundaria"
              avatar="/placeholder.svg?height=80&width=80"
            />
            <TestimonialCard
              quote="Usamos MuralApp para todas nuestras sesiones de lluvia de ideas. Ha mejorado nuestra creatividad un 200%."
              author="Carlos Gómez"
              role="Director de Innovación"
              avatar="/placeholder.svg?height=80&width=80"
            />
            <TestimonialCard
              quote="La interfaz es tan intuitiva que incluso mis colegas menos tecnológicos la adoptaron rápidamente."
              author="Laura Martínez"
              role="Gerente de Proyectos"
              avatar="/placeholder.svg?height=80&width=80"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para empezar a crear?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya están creando murales colaborativos increíbles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button className="text-lg px-8 py-6 bg-white text-pink-600 hover:bg-gray-100">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
                Iniciar sesión
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">No se requiere tarjeta de crédito</p>
        </div>
      </section>
    </div>
  )
}

// Componentes auxiliares
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-muted hover:border-purple-200 hover:shadow-md transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string
  author: string
  role: string
  avatar: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-muted hover:shadow-md transition-all">
      <div className="mb-4">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.667 13.333H5.33366C5.33366 8 9.33366 8 9.33366 8C9.33366 6.667 8.00033 4 5.33366 4C2.66699 4 1.33366 6.667 1.33366 8"
            stroke="#D946EF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24.0003 13.333H18.667C18.667 8 22.667 8 22.667 8C22.667 6.667 21.3337 4 18.667 4C16.0003 4 14.667 6.667 14.667 8"
            stroke="#D946EF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="1.33366" y="13.333" width="12" height="10.6667" rx="2" stroke="#D946EF" strokeWidth="2" />
          <rect x="14.667" y="13.333" width="12" height="10.6667" rx="2" stroke="#D946EF" strokeWidth="2" />
        </svg>
      </div>
      <p className="mb-6 text-muted-foreground">{quote}</p>
      <div className="flex items-center gap-3">
        <Image src={avatar || "/placeholder.svg"} alt={author} width={40} height={40} className="rounded-full" />
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  )
}

function DeviceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

function TemplateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )
}
