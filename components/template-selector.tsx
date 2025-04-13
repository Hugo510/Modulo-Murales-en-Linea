"use client"

import { Check, Sparkles } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Plantillas predefinidas
const templates = [
  {
    id: "default",
    name: "Estándar",
    description: "Diseño básico para cualquier tipo de contenido",
    background: "bg-gradient-to-br from-blue-50 to-cyan-100",
    itemStyle: "bg-white shadow-md rounded-lg",
    textColor: "text-gray-800",
  },
  {
    id: "education",
    name: "Educativo",
    description: "Ideal para entornos de aprendizaje y aulas virtuales",
    background: "bg-gradient-to-br from-green-50 to-emerald-100",
    itemStyle: "bg-white shadow-md rounded-lg border-l-4 border-green-500",
    textColor: "text-gray-800",
  },
  {
    id: "brainstorm",
    name: "Lluvia de ideas",
    description: "Perfecto para sesiones creativas y colaborativas",
    background: "bg-gradient-to-br from-purple-50 to-pink-100",
    itemStyle: "bg-white shadow-md rounded-lg rotate-1",
    textColor: "text-gray-800",
  },
  {
    id: "project",
    name: "Gestión de proyectos",
    description: "Organiza tareas y seguimiento de proyectos",
    background: "bg-gradient-to-br from-blue-50 to-indigo-100",
    itemStyle: "bg-white shadow-md rounded-lg border-t-4 border-blue-500",
    textColor: "text-gray-800",
  },
  {
    id: "presentation",
    name: "Presentación",
    description: "Diseño limpio para presentaciones profesionales",
    background: "bg-gradient-to-br from-gray-50 to-slate-200",
    itemStyle: "bg-white shadow-md rounded-lg",
    textColor: "text-gray-800",
  },
  {
    id: "creative",
    name: "Creativo",
    description: "Diseño colorido para expresión artística",
    background: "bg-gradient-to-br from-orange-50 to-amber-100",
    itemStyle: "bg-white shadow-md rounded-lg -rotate-1",
    textColor: "text-gray-800",
  },
]

interface TemplateSelectorProps {
  value: string
  onChange: (template: any) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-medium">Plantillas temáticas</h3>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(templateId) => {
          const template = templates.find((t) => t.id === templateId)
          if (template) {
            onChange(template)
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {templates.map((template) => (
          <div key={template.id} className="relative">
            <RadioGroupItem value={template.id} id={`template-${template.id}`} className="peer sr-only" />
            <Label
              htmlFor={`template-${template.id}`}
              className={cn(
                "flex flex-col h-full p-4 rounded-lg border-2 cursor-pointer hover:border-primary",
                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary",
              )}
            >
              <div className={cn("w-full h-24 rounded-md mb-3", template.background)}>
                <div className={cn("w-1/2 h-12 m-2", template.itemStyle)}></div>
                <div className={cn("w-1/3 h-8 ml-auto mr-4", template.itemStyle)}></div>
              </div>
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              </div>
              {value === template.id && (
                <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
