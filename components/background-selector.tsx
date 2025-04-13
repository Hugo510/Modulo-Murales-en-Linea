"use client"

import { useState } from "react"
import { Check, ImageIcon, Grid, Paintbrush } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

// Patrones predefinidos
const patterns = [
  {
    id: "dots",
    name: "Puntos",
    class: "bg-white bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-[size:20px_20px]",
  },
  {
    id: "grid",
    name: "Cuadrícula",
    class:
      "bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:20px_20px]",
  },
  {
    id: "diagonal",
    name: "Diagonal",
    class: "bg-white bg-[repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0_1px,#ffffff_1px,#ffffff_10px)]",
  },
  {
    id: "zigzag",
    name: "Zigzag",
    class: "bg-white bg-[repeating-linear-gradient(-45deg,#f0f0f0,#f0f0f0_10px,#ffffff_10px,#ffffff_20px)]",
  },
  {
    id: "stripes",
    name: "Rayas",
    class: "bg-white bg-[repeating-linear-gradient(0deg,#f0f0f0,#f0f0f0_1px,#ffffff_1px,#ffffff_10px)]",
  },
  {
    id: "waves",
    name: "Ondas",
    class: "bg-white bg-[url('/patterns/waves.svg')] bg-repeat bg-[length:20px_20px]",
  },
]

// Fondos de imagen predefinidos
const imageBackgrounds = [
  { id: "abstract1", name: "Abstracto 1", url: "/backgrounds/abstract1.jpg" },
  { id: "abstract2", name: "Abstracto 2", url: "/backgrounds/abstract2.jpg" },
  { id: "nature1", name: "Naturaleza 1", url: "/backgrounds/nature1.jpg" },
  { id: "nature2", name: "Naturaleza 2", url: "/backgrounds/nature2.jpg" },
  { id: "geometry1", name: "Geometría 1", url: "/backgrounds/geometry1.jpg" },
  { id: "geometry2", name: "Geometría 2", url: "/backgrounds/geometry2.jpg" },
]

// Colores predefinidos
const colorBackgrounds = [
  { id: "blue-gradient", name: "Azul Gradiente", class: "bg-gradient-to-br from-blue-50 to-cyan-100" },
  { id: "purple-gradient", name: "Púrpura Gradiente", class: "bg-gradient-to-br from-purple-50 to-pink-100" },
  { id: "green-gradient", name: "Verde Gradiente", class: "bg-gradient-to-br from-green-50 to-emerald-100" },
  { id: "orange-gradient", name: "Naranja Gradiente", class: "bg-gradient-to-br from-orange-50 to-amber-100" },
  { id: "gray-gradient", name: "Gris Gradiente", class: "bg-gradient-to-br from-gray-50 to-slate-200" },
  { id: "white", name: "Blanco", class: "bg-white" },
  { id: "light-blue", name: "Azul Claro", class: "bg-blue-50" },
  { id: "light-green", name: "Verde Claro", class: "bg-green-50" },
  { id: "light-purple", name: "Púrpura Claro", class: "bg-purple-50" },
  { id: "light-yellow", name: "Amarillo Claro", class: "bg-yellow-50" },
]

interface BackgroundSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  const [customColor, setCustomColor] = useState("#f8f9fa")
  const [patternOpacity, setPatternOpacity] = useState(20)
  const [customImageUrl, setCustomImageUrl] = useState("")

  const handlePatternOpacityChange = (newValue: number[]) => {
    setPatternOpacity(newValue[0])
  }

  const applyCustomColor = () => {
    onChange(customColor)
  }

  const applyCustomImage = () => {
    if (customImageUrl) {
      onChange(`url(${customImageUrl})`)
    }
  }

  return (
    <Tabs defaultValue="colors" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          Colores
        </TabsTrigger>
        <TabsTrigger value="patterns" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Patrones
        </TabsTrigger>
        <TabsTrigger value="images" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Imágenes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="space-y-4">
        <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {colorBackgrounds.map((bg) => (
            <div key={bg.id} className="relative">
              <RadioGroupItem value={bg.class} id={`color-${bg.id}`} className="peer sr-only" />
              <Label
                htmlFor={`color-${bg.id}`}
                className={cn(
                  "flex flex-col items-center justify-center p-4 h-24 rounded-lg border-2 cursor-pointer hover:border-primary",
                  bg.class,
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary",
                )}
              >
                <span className="mt-2 text-xs font-medium">{bg.name}</span>
                {value === bg.class && (
                  <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="custom-color">Color personalizado</Label>
          <div className="flex gap-2">
            <Input
              id="custom-color"
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1"
              placeholder="#RRGGBB"
            />
            <Button onClick={applyCustomColor} size="sm">
              Aplicar
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="patterns" className="space-y-4">
        <div className="space-y-2 mb-4">
          <Label>Opacidad del patrón</Label>
          <div className="flex items-center gap-4">
            <Slider
              defaultValue={[patternOpacity]}
              max={100}
              step={5}
              onValueChange={handlePatternOpacityChange}
              className="flex-1"
            />
            <span className="w-12 text-center">{patternOpacity}%</span>
          </div>
        </div>

        <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="relative">
              <RadioGroupItem value={pattern.class} id={`pattern-${pattern.id}`} className="peer sr-only" />
              <Label
                htmlFor={`pattern-${pattern.id}`}
                className={cn(
                  "flex flex-col items-center justify-center p-4 h-24 rounded-lg border-2 cursor-pointer hover:border-primary",
                  pattern.class,
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary",
                )}
                style={{ opacity: patternOpacity / 100 + 0.2 }}
              >
                <span className="mt-2 text-xs font-medium bg-white/80 px-2 py-1 rounded">{pattern.name}</span>
                {value === pattern.class && (
                  <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imageBackgrounds.map((bg) => (
            <div key={bg.id} className="relative">
              <RadioGroupItem value={`url(${bg.url})`} id={`image-${bg.id}`} className="peer sr-only" />
              <Label
                htmlFor={`image-${bg.id}`}
                className="flex flex-col items-center justify-center p-4 h-24 rounded-lg border-2 cursor-pointer hover:border-primary bg-cover bg-center peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                style={{ backgroundImage: `url(${bg.url})` }}
              >
                <span className="mt-2 text-xs font-medium bg-white/80 px-2 py-1 rounded">{bg.name}</span>
                {value === `url(${bg.url})` && (
                  <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="custom-image">URL de imagen personalizada</Label>
          <div className="flex gap-2">
            <Input
              id="custom-image"
              type="text"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="flex-1"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <Button onClick={applyCustomImage} size="sm">
              Aplicar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Introduce la URL de una imagen. Asegúrate de que tienes permiso para usarla.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
