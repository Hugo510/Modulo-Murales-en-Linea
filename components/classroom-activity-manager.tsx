"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface ClassroomActivityManagerProps {
  muralId: string
  muralTitle: string
  muralDescription: string
}

export function ClassroomActivityManager({ muralId, muralTitle, muralDescription }: ClassroomActivityManagerProps) {
  const { toast } = useToast()
  const [activityTitle, setActivityTitle] = useState(muralTitle || "")
  const [activityDescription, setActivityDescription] = useState(muralDescription || "")
  const [activityType, setActivityType] = useState("collaborative")
  const [skillsToEvaluate, setSkillsToEvaluate] = useState("")
  const [timeLimit, setTimeLimit] = useState(30)
  const [allowComments, setAllowComments] = useState(true)
  const [isGraded, setIsGraded] = useState(false)
  const [maxPoints, setMaxPoints] = useState(100)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSaveActivity = () => {
    setIsSubmitting(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Actividad guardada",
        description: "La actividad educativa ha sido configurada correctamente.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-700 mb-2">Configuración de Actividad Educativa</h2>
        <p className="text-muted-foreground">
          Configura este mural como una actividad educativa para compartir con tus estudiantes.
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            Información básica
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            Configuración
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            Evaluación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="activity-title">Título de la actividad</Label>
            <Input
              id="activity-title"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              className="border-2 focus-visible:ring-amber-500"
              placeholder="Ej: Lluvia de ideas para el proyecto final"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-description">Descripción de la actividad</Label>
            <Textarea
              id="activity-description"
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              rows={4}
              className="border-2 focus-visible:ring-amber-500"
              placeholder="Describe la actividad y sus objetivos..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-type">Tipo de actividad</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity-type" className="border-2 focus-visible:ring-amber-500">
                <SelectValue placeholder="Selecciona el tipo de actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collaborative">Colaborativa</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="group">Trabajo en grupos</SelectItem>
                <SelectItem value="presentation">Presentación</SelectItem>
                <SelectItem value="brainstorming">Lluvia de ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades a evaluar</Label>
            <Textarea
              id="skills"
              value={skillsToEvaluate}
              onChange={(e) => setSkillsToEvaluate(e.target.value)}
              className="border-2 focus-visible:ring-amber-500"
              placeholder="Ej: Creatividad, trabajo en equipo, comunicación..."
            />
            <p className="text-xs text-muted-foreground">Separa las habilidades con comas</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración de tiempo</h3>
            <div className="flex items-end gap-2">
              <div className="space-y-2 flex-1">
                <Label htmlFor="time-limit">Tiempo límite (minutos)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  min={1}
                  max={240}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                  className="border-2 focus-visible:ring-amber-500"
                />
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600 mb-[2px]">
                Iniciar temporizador
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Permisos</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Permitir comentarios</p>
                <p className="text-sm text-muted-foreground">Los estudiantes pueden comentar sobre el trabajo</p>
              </div>
              <Switch
                checked={allowComments}
                onCheckedChange={setAllowComments}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Permitir edición anónima</p>
                <p className="text-sm text-muted-foreground">Los estudiantes pueden editar sin identificarse</p>
              </div>
              <Switch className="data-[state=checked]:bg-amber-500" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Visible para todos los estudiantes</p>
                <p className="text-sm text-muted-foreground">Todos pueden ver los trabajos de los demás</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-amber-500" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Actividad calificable</p>
              <p className="text-sm text-muted-foreground">Los estudiantes recibirán una calificación</p>
            </div>
            <Switch
              checked={isGraded}
              onCheckedChange={setIsGraded}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {isGraded && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label htmlFor="max-points">Puntuación máxima</Label>
                <Input
                  id="max-points"
                  type="number"
                  min={1}
                  max={1000}
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(parseInt(e.target.value) || 100)}
                  className="border-2 focus-visible:ring-amber-500 w-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Rúbrica de evaluación</Label>
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Criterio 1: Claridad de ideas</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <p className="text-muted-foreground">
                        Las ideas presentadas son claras, bien organizadas y fáciles de entender.
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <span className="text-sm font-medium">0-25 puntos</span>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </CardFooter>
                  </Card>

                  <Button variant="outline" className="border-dashed">
                    + Añadir criterio
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline">Cancelar</Button>
        <Button
          onClick={handleSaveActivity}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            "Guardar actividad"
          )}
        </Button>
      </div>
    </div>
  )
}
