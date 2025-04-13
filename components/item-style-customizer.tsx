"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Type, PanelTop, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

// Estilos de borde predefinidos
const borderStyles = [
  { id: "none", name: "Sin borde", class: "border-0" },
  { id: "thin", name: "Fino", class: "border" },
  { id: "medium", name: "Medio", class: "border-2" },
  { id: "thick", name: "Grueso", class: "border-4" },
  { id: "left", name: "Izquierda", class: "border-l-4" },
  { id: "top", name: "Superior", class: "border-t-4" },
  { id: "right", name: "Derecha", class: "border-r-4" },
  { id: "bottom", name: "Inferior", class: "border-b-4" },
]

// Estilos de sombra predefinidos
const shadowStyles = [
  { id: "none", name: "Sin sombra", class: "shadow-none" },
  { id: "sm", name: "Pequeña", class: "shadow-sm" },
  { id: "md", name: "Media", class: "shadow-md" },
  { id: "lg", name: "Grande", class: "shadow-lg" },
  { id: "xl", name: "Extra grande", class: "shadow-xl" },
  { id: "inner", name: "Interior", class: "shadow-inner" },
]

// Estilos de fuente predefinidos
const fontStyles = [
  { id: "sans", name: "Sans-serif", class: "font-sans" },
  { id: "serif", name: "Serif", class: "font-serif" },
  { id: "mono", name: "Monospace", class: "font-mono" },
]

// Tamaños de fuente predefinidos
const fontSizes = [
  { id: "xs", name: "Muy pequeño", class: "text-xs" },
  { id: "sm", name: "Pequeño", class: "text-sm" },
  { id: "base", name: "Normal", class: "text-base" },
  { id: "lg", name: "Grande", class: "text-lg" },
  { id: "xl", name: "Muy grande", class: "text-xl" },
  { id: "2xl", name: "Extra grande", class: "text-2xl" },
]

interface ItemStyleCustomizerProps {
  value: {
    borderStyle: string
    borderColor: string
    backgroundColor: string
    textColor: string
    shadowStyle: string
    borderRadius: number
    fontStyle: string
    fontSize: string
    rotation: number
  }
  onChange: (styles: any) => void
}

export function ItemStyleCustomizer({ value, onChange }: ItemStyleCustomizerProps) {
  const [borderColor, setBorderColor] = useState(value.borderColor || "#e2e8f0")
  const [backgroundColor, setBackgroundColor] = useState(value.backgroundColor || "#ffffff")
  const [textColor, setTextColor] = useState(value.textColor || "#1e293b")

  const updateStyle = (key: string, newValue: any) => {
    onChange({ ...value, [key]: newValue })
  }

  const applyBorderColor = () => {
    updateStyle("borderColor", borderColor)
  }

  const applyBackgroundColor = () => {
    updateStyle("backgroundColor", backgroundColor)
  }

  const applyTextColor = () => {
    updateStyle("textColor", textColor)
  }

  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Apariencia
        </TabsTrigger>
        <TabsTrigger value="typography" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Tipografía
        </TabsTrigger>
        <TabsTrigger value="layout" className="flex items-center gap-2">
          <PanelTop className="h-4 w-4" />
          Diseño
        </TabsTrigger>
      </TabsList>

      <TabsContent value="appearance" className="space-y-4">
        <div className="space-y-2">
          <Label>Estilo de borde</Label>
          <RadioGroup
            value={value.borderStyle}
            onValueChange={(newValue) => updateStyle("borderStyle", newValue)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {borderStyles.map((style) => (
              <div key={style.id} className="relative">
                <RadioGroupItem value={style.class} id={`border-${style.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`border-${style.id}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 h-16 rounded-lg border cursor-pointer hover:bg-muted",
                    style.class,
                    "peer-data-[state=checked]:bg-muted peer-data-[state=checked]:border-primary",
                  )}
                  style={{ borderColor: value.borderColor }}
                >
                  <span className="text-xs font-medium mt-2">{style.name}</span>
                  {value.borderStyle === style.class && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Color de borde</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="flex-1"
              placeholder="#RRGGBB"
            />
            <Button onClick={applyBorderColor} size="sm">
              Aplicar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color de fondo</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1"
              placeholder="#RRGGBB"
            />
            <Button onClick={applyBackgroundColor} size="sm">
              Aplicar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Estilo de sombra</Label>
          <RadioGroup
            value={value.shadowStyle}
            onValueChange={(newValue) => updateStyle("shadowStyle", newValue)}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {shadowStyles.map((style) => (
              <div key={style.id} className="relative">
                <RadioGroupItem value={style.class} id={`shadow-${style.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`shadow-${style.id}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 h-16 rounded-lg border cursor-pointer hover:bg-muted bg-white",
                    style.class,
                    "peer-data-[state=checked]:bg-muted peer-data-[state=checked]:border-primary",
                  )}
                >
                  <span className="text-xs font-medium mt-2">{style.name}</span>
                  {value.shadowStyle === style.class && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Redondeo de bordes: {value.borderRadius}px</Label>
          <Slider
            value={[value.borderRadius]}
            min={0}
            max={24}
            step={1}
            onValueChange={(newValue) => updateStyle("borderRadius", newValue[0])}
          />
        </div>
      </TabsContent>

      <TabsContent value="typography" className="space-y-4">
        <div className="space-y-2">
          <Label>Estilo de fuente</Label>
          <RadioGroup
            value={value.fontStyle}
            onValueChange={(newValue) => updateStyle("fontStyle", newValue)}
            className="grid grid-cols-3 gap-3"
          >
            {fontStyles.map((style) => (
              <div key={style.id} className="relative">
                <RadioGroupItem value={style.class} id={`font-${style.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`font-${style.id}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 h-16 rounded-lg border cursor-pointer hover:bg-muted",
                    style.class,
                    "peer-data-[state=checked]:bg-muted peer-data-[state=checked]:border-primary",
                  )}
                >
                  <span className="text-xs font-medium mt-2">{style.name}</span>
                  {value.fontStyle === style.class && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Tamaño de fuente</Label>
          <RadioGroup
            value={value.fontSize}
            onValueChange={(newValue) => updateStyle("fontSize", newValue)}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {fontSizes.map((size) => (
              <div key={size.id} className="relative">
                <RadioGroupItem value={size.class} id={`size-${size.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`size-${size.id}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 h-16 rounded-lg border cursor-pointer hover:bg-muted",
                    "peer-data-[state=checked]:bg-muted peer-data-[state=checked]:border-primary",
                  )}
                >
                  <span className={cn("font-medium", size.class)}>{size.name}</span>
                  {value.fontSize === size.class && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" />
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Color de texto</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1"
              placeholder="#RRGGBB"
            />
            <Button onClick={applyTextColor} size="sm">
              Aplicar
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="layout" className="space-y-4">
        <div className="space-y-2">
          <Label>Rotación: {value.rotation}°</Label>
          <Slider
            value={[value.rotation]}
            min={-10}
            max={10}
            step={1}
            onValueChange={(newValue) => updateStyle("rotation", newValue[0])}
          />
          <div className="h-24 flex items-center justify-center">
            <div
              className="w-32 h-16 bg-white border flex items-center justify-center"
              style={{
                transform: `rotate(${value.rotation}deg)`,
                borderRadius: `${value.borderRadius}px`,
                borderColor: value.borderColor,
                backgroundColor: value.backgroundColor,
                color: value.textColor,
                boxShadow: value.shadowStyle === "shadow-none" ? "none" : "",
              }}
              className={cn(value.borderStyle, value.shadowStyle, value.fontStyle)}
            >
              <span className={cn(value.fontSize)}>Ejemplo</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
