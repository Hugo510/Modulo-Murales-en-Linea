import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, BookOpen, Lightbulb, HelpCircle, Video, FileText, Users, Palette } from "lucide-react"

export default function GuiaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            Guía de Uso
          </h1>
          <p className="text-xl text-muted-foreground">
            Aprende a utilizar todas las funcionalidades de MuralApp para crear murales colaborativos increíbles
          </p>
        </div>

        <Tabs defaultValue="primeros-pasos" className="mb-12">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger
              value="primeros-pasos"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Primeros pasos
            </TabsTrigger>
            <TabsTrigger
              value="funcionalidades"
              className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Funcionalidades
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <HelpCircle className="h-4 w-4 mr-2" />
              Preguntas frecuentes
            </TabsTrigger>
            <TabsTrigger
              value="tutoriales"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Video className="h-4 w-4 mr-2" />
              Tutoriales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="primeros-pasos" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-4">
                  <h3 className="text-xl font-bold text-white">Crear tu primer mural</h3>
                </div>
                <CardContent className="p-6">
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="text-sm">
                      Haz clic en el botón <Badge className="bg-pink-500">Nuevo Mural</Badge> en la página principal
                    </li>
                    <li className="text-sm">
                      Completa el formulario con el título, descripción y selecciona un color de fondo para tu mural
                    </li>
                    <li className="text-sm">Elige el diseño que prefieras: cuadrícula o mosaico</li>
                    <li className="text-sm">
                      Configura las opciones de privacidad y colaboración según tus necesidades
                    </li>
                    <li className="text-sm">
                      Haz clic en <Badge className="bg-pink-500">Crear Mural</Badge> para finalizar
                    </li>
                  </ol>
                  <div className="mt-6">
                    <Link href="/murales/nuevo">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        size="sm"
                      >
                        Crear un mural ahora
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-4">
                  <h3 className="text-xl font-bold text-white">Añadir contenido</h3>
                </div>
                <CardContent className="p-6">
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="text-sm">
                      Dentro de tu mural, haz clic en el botón <Badge className="bg-pink-500">Añadir</Badge> en la barra
                      de herramientas
                    </li>
                    <li className="text-sm">
                      Selecciona el tipo de contenido que deseas añadir: texto, imagen, enlace, video o archivo
                    </li>
                    <li className="text-sm">
                      Completa la información requerida para el tipo de contenido seleccionado
                    </li>
                    <li className="text-sm">Personaliza el color de fondo del elemento</li>
                    <li className="text-sm">
                      Haz clic en <Badge className="bg-pink-500">Añadir</Badge> para agregar el elemento a tu mural
                    </li>
                  </ol>
                  <div className="mt-6">
                    <div className="bg-muted/50 p-4 rounded-md text-sm">
                      <p className="font-medium mb-2">💡 Consejo:</p>
                      <p>Puedes mover los elementos arrastrándolos a cualquier posición dentro del lienzo del mural.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4">
                <h3 className="text-xl font-bold text-white">Invitar colaboradores</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="text-sm">
                        Dentro de tu mural, haz clic en el botón <Badge>Colaboradores</Badge> en la barra superior
                      </li>
                      <li className="text-sm">
                        En el diálogo que aparece, ingresa el correo electrónico de la persona que deseas invitar
                      </li>
                      <li className="text-sm">Selecciona el rol que tendrá: Propietario, Editor o Visualizador</li>
                      <li className="text-sm">
                        Haz clic en el botón <Badge className="bg-blue-500">+</Badge> para añadir al colaborador
                      </li>
                      <li className="text-sm">
                        El colaborador recibirá una notificación por correo electrónico con un enlace para acceder al
                        mural
                      </li>
                    </ol>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-muted/50 p-4 rounded-md text-sm w-full">
                      <p className="font-medium mb-2">🔑 Roles de colaboración:</p>
                      <ul className="space-y-2">
                        <li>
                          <span className="font-medium">Propietario:</span> Control total sobre el mural, incluyendo
                          eliminar y cambiar permisos
                        </li>
                        <li>
                          <span className="font-medium">Editor:</span> Puede añadir, editar y eliminar contenido
                        </li>
                        <li>
                          <span className="font-medium">Visualizador:</span> Solo puede ver el mural y añadir
                          comentarios si está permitido
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                Recorrido interactivo
              </h3>
              <p className="mb-4">
                ¿Prefieres aprender mientras usas la aplicación? Nuestro recorrido interactivo te guiará paso a paso por
                todas las funcionalidades principales.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                Iniciar recorrido guiado
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="funcionalidades" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-3"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-bold">Tipos de contenido</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Añade diversos tipos de contenido a tus murales para hacerlos más interactivos y completos.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Texto</Badge>
                      <span>Notas, ideas y conceptos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Imagen</Badge>
                      <span>Fotos, diagramas e ilustraciones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">Enlace</Badge>
                      <span>Enlaces a sitios web externos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-red-500">Video</Badge>
                      <span>Videos de YouTube, Vimeo, etc.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-amber-500">Archivo</Badge>
                      <span>Documentos PDF, DOCX, XLSX, etc.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold">Colaboración</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Trabaja en equipo en tiempo real con todas las herramientas de colaboración.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Edición en tiempo real</Badge>
                      <span>Cambios visibles al instante</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Comentarios</Badge>
                      <span>Discusiones sobre elementos específicos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">Control de roles</Badge>
                      <span>Gestión de permisos por usuario</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-pink-500">Historial de cambios</Badge>
                      <span>Seguimiento de modificaciones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-amber-500">Notificaciones</Badge>
                      <span>Alertas sobre actividad reciente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-green-400 to-teal-500 h-3"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Palette className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold">Personalización</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adapta la apariencia de tus murales según tus preferencias y necesidades.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-pink-500">Colores</Badge>
                      <span>Fondos y elementos personalizables</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Diseños</Badge>
                      <span>Cuadrícula o mosaico</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Temas</Badge>
                      <span>Claro, oscuro o según el sistema</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-amber-500">Organización</Badge>
                      <span>Posicionamiento libre de elementos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">Vistas</Badge>
                      <span>Lienzo, presentación o línea de tiempo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-4">
                <h3 className="text-xl font-bold text-white">Modos de visualización</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          1
                        </span>
                        Modo Lienzo
                      </h4>
                      <p className="text-sm">
                        Vista principal donde puedes añadir, editar y organizar elementos libremente en un espacio
                        abierto. Ideal para lluvia de ideas y organización visual.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                        <span className="bg-green-200 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          2
                        </span>
                        Modo Presentación
                      </h4>
                      <p className="text-sm">
                        Convierte tu mural en una presentación de diapositivas donde cada elemento se muestra como una
                        diapositiva individual. Perfecto para exposiciones.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                        <span className="bg-purple-200 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          3
                        </span>
                        Modo Línea de Tiempo
                      </h4>
                      <p className="text-sm">
                        Visualiza los elementos en orden cronológico según fueron añadidos. Útil para seguir la
                        evolución de ideas o proyectos a lo largo del tiempo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">💡 Cómo cambiar entre modos:</p>
                  <p className="text-sm">
                    Dentro de tu mural, utiliza las pestañas en la parte superior para alternar entre los diferentes
                    modos de visualización. Cada modo ofrece una forma única de interactuar con tu contenido.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-4">
                <h3 className="text-xl font-bold text-white">Compartir y exportar</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-3">Opciones de compartir</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-pink-500">Enlace</Badge>
                        <div>
                          <p className="font-medium">Compartir mediante enlace</p>
                          <p className="text-muted-foreground">
                            Genera un enlace que puedes enviar a cualquier persona para que acceda al mural
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-blue-500">Redes sociales</Badge>
                        <div>
                          <p className="font-medium">Compartir en redes sociales</p>
                          <p className="text-muted-foreground">
                            Publica tu mural directamente en Facebook, Twitter, LinkedIn o por correo electrónico
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-amber-500">Protección</Badge>
                        <div>
                          <p className="font-medium">Proteger con contraseña</p>
                          <p className="text-muted-foreground">
                            Añade una capa adicional de seguridad requiriendo una contraseña para acceder
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3">Opciones de exportación</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-green-500">PDF</Badge>
                        <div>
                          <p className="font-medium">Exportar como PDF</p>
                          <p className="text-muted-foreground">
                            Guarda tu mural como un documento PDF para compartir o imprimir
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-purple-500">Imagen</Badge>
                        <div>
                          <p className="font-medium">Exportar como imagen</p>
                          <p className="text-muted-foreground">
                            Guarda tu mural como una imagen PNG o JPG de alta resolución
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge className="mt-0.5 bg-blue-500">Presentación</Badge>
                        <div>
                          <p className="font-medium">Exportar como presentación</p>
                          <p className="text-muted-foreground">
                            Convierte tu mural en una presentación de diapositivas en formato PPTX
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-8">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  Preguntas frecuentes
                </h3>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Cuántos murales puedo crear con mi cuenta?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Con una cuenta gratuita, puedes crear hasta 5 murales activos simultáneamente. Si necesitas crear
                      más murales, puedes actualizar a nuestro plan Premium que ofrece murales ilimitados y
                      funcionalidades adicionales.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Cuántas personas pueden colaborar en un mismo mural?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      En la versión gratuita, puedes invitar hasta 10 colaboradores por mural. Con el plan Premium, este
                      límite se amplía a 50 colaboradores por mural, ideal para equipos grandes o clases numerosas.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Puedo usar MuralApp sin conexión a internet?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Actualmente, MuralApp requiere conexión a internet para funcionar correctamente, ya que es una
                      aplicación basada en la nube. Sin embargo, estamos trabajando en una funcionalidad de modo sin
                      conexión que permitirá editar murales localmente y sincronizarlos cuando vuelvas a conectarte.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Qué tipos de archivos puedo subir a mis murales?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <p>Puedes subir los siguientes tipos de archivos:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Imágenes: JPG, PNG, GIF, SVG (máximo 10MB)</li>
                        <li>Documentos: PDF, DOCX, XLSX, PPTX (máximo 20MB)</li>
                        <li>Audio: MP3, WAV (máximo 30MB)</li>
                        <li>Video: Se recomienda usar enlaces a plataformas como YouTube o Vimeo</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Cómo puedo recuperar un mural eliminado?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Los murales eliminados se mantienen en la papelera durante 30 días. Para recuperarlos, ve a la
                      sección &quot;Papelera&quot; en tu perfil, busca el mural que deseas recuperar y haz clic en
                      &quot;Restaurar&quot;. Después de 30 días, los murales se eliminan permanentemente y no pueden ser
                      recuperados.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left font-medium">
                      ¿Puedo integrar MuralApp con otras herramientas?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Sí, MuralApp ofrece integraciones con varias herramientas populares como Google Drive, Microsoft
                      Office, Trello, Slack y Zoom. Estas integraciones te permiten importar contenido directamente
                      desde estas plataformas o compartir tus murales en ellas. Puedes configurar las integraciones
                      desde la sección de Configuración en tu perfil.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                ¿No encuentras respuesta a tu pregunta?
              </h3>
              <p className="mb-4">
                Si tienes alguna duda que no está resuelta en nuestras preguntas frecuentes, no dudes en contactar con
                nuestro equipo de soporte. Estaremos encantados de ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Contactar soporte
                </Button>
                <Button variant="outline">Consultar documentación</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutoriales" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="relative h-48 bg-gradient-to-r from-green-400 to-teal-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Introducción a MuralApp</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Aprende los conceptos básicos para comenzar a utilizar MuralApp de manera efectiva.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Básico</Badge>
                      <span className="text-xs text-muted-foreground">10 minutos</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                      Ver tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="relative h-48 bg-gradient-to-r from-purple-400 to-pink-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Colaboración en tiempo real</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Descubre cómo trabajar eficientemente con tu equipo en un mismo mural.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Intermedio</Badge>
                      <span className="text-xs text-muted-foreground">15 minutos</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      Ver tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="relative h-48 bg-gradient-to-r from-blue-400 to-cyan-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Diseño avanzado de murales</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Técnicas para crear murales visualmente atractivos y bien organizados.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Avanzado</Badge>
                      <span className="text-xs text-muted-foreground">20 minutos</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      Ver tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
                <div className="relative h-48 bg-gradient-to-r from-amber-400 to-orange-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">MuralApp para educación</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cómo utilizar MuralApp en entornos educativos para mejorar el aprendizaje.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500">Especializado</Badge>
                      <span className="text-xs text-muted-foreground">25 minutos</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                      Ver tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden border-2 hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-pink-400 to-red-500 p-4">
                <h3 className="text-xl font-bold text-white">Tutoriales paso a paso</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cómo organizar un mural para lluvia de ideas</h4>
                      <p className="text-sm text-muted-foreground">
                        Guía detallada para estructurar un mural efectivo para sesiones de brainstorming.
                      </p>
                      <Button variant="link" className="p-0 h-auto text-pink-600">
                        Leer guía
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Plantillas para proyectos educativos</h4>
                      <p className="text-sm text-muted-foreground">
                        Colección de plantillas prediseñadas para diferentes asignaturas y niveles educativos.
                      </p>
                      <Button variant="link" className="p-0 h-auto text-purple-600">
                        Ver plantillas
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mejores prácticas para la colaboración</h4>
                      <p className="text-sm text-muted-foreground">
                        Consejos y técnicas para maximizar la eficiencia del trabajo en equipo.
                      </p>
                      <Button variant="link" className="p-0 h-auto text-blue-600">
                        Leer artículo
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Guía de accesibilidad</h4>
                      <p className="text-sm text-muted-foreground">
                        Cómo crear murales accesibles para todos los usuarios, incluyendo aquellos con discapacidades.
                      </p>
                      <Button variant="link" className="p-0 h-auto text-green-600">
                        Leer guía
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
                Webinars y eventos en vivo
              </h3>
              <p className="mb-6">
                Participa en nuestros webinars y sesiones de formación en vivo para aprender directamente de nuestros
                expertos y hacer preguntas en tiempo real.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Masterclass: Diseño visual efectivo</h4>
                      <p className="text-sm text-muted-foreground">15 de mayo, 18:00 - 19:30</p>
                    </div>
                    <Badge className="bg-green-500">Próximo</Badge>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Registrarse
                  </Button>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Taller: MuralApp para empresas</h4>
                      <p className="text-sm text-muted-foreground">22 de mayo, 16:00 - 17:30</p>
                    </div>
                    <Badge className="bg-blue-500">Próximo</Badge>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Registrarse
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            ¿Listo para crear murales increíbles?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Con esta guía ya tienes todo lo necesario para comenzar a crear murales colaborativos impresionantes.
            ¡Empieza ahora y desata tu creatividad!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/murales/nuevo">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                Crear mi primer mural
              </Button>
            </Link>
            <Link href="/explorar">
              <Button variant="outline">Explorar ejemplos</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
