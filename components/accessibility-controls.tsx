"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accessibility, Sun, Moon, Type, Minus, Plus, RotateCcw, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)

  // Aplicar configuraciones de accesibilidad
  useEffect(() => {
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem("accessibilitySettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setFontSize(settings.fontSize || 100)
      setContrast(settings.contrast || 100)
      setBrightness(settings.brightness || 100)
      setReducedMotion(settings.reducedMotion || false)
      setHighContrast(settings.highContrast || false)
      setDyslexicFont(settings.dyslexicFont || false)
    }
  }, [])

  // Guardar y aplicar cambios
  useEffect(() => {
    // Guardar configuraciones
    const settings = {
      fontSize,
      contrast,
      brightness,
      reducedMotion,
      highContrast,
      dyslexicFont,
    }
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings))

    // Aplicar configuraciones al documento
    document.documentElement.style.setProperty("--font-size-multiplier", `${fontSize / 100}`)
    document.documentElement.style.setProperty("--contrast", `${contrast}%`)
    document.documentElement.style.setProperty("--brightness", `${brightness}%`)

    // Aplicar fuente para dislexia
    if (dyslexicFont) {
      document.documentElement.classList.add("dyslexic-font")
    } else {
      document.documentElement.classList.remove("dyslexic-font")
    }

    // Aplicar alto contraste
    if (highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Aplicar movimiento reducido
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }
  }, [fontSize, contrast, brightness, reducedMotion, highContrast, dyslexicFont])

  // Restablecer configuraciones
  const resetSettings = () => {
    setFontSize(100)
    setContrast(100)
    setBrightness(100)
    setReducedMotion(false)
    setHighContrast(false)
    setDyslexicFont(false)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg border-2 border-primary/20 bg-white hover:bg-primary/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Controles de accesibilidad"
            >
              <Accessibility className="h-6 w-6 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Accesibilidad</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-20 right-20 z-50 bg-white rounded-lg shadow-xl border w-80"
          >
            <div className="p-4 border-b">
              <h2 className="font-medium flex items-center">
                <Accessibility className="h-5 w-5 mr-2 text-primary" />
                Opciones de accesibilidad
              </h2>
            </div>

            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    <Type className="h-4 w-4 mr-2" />
                    Tamaño de texto
                  </Label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setFontSize(Math.max(70, fontSize - 10))}
                      disabled={fontSize <= 70}
                      aria-label="Reducir tamaño de texto"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center text-sm">{fontSize}%</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                      disabled={fontSize >= 150}
                      aria-label="Aumentar tamaño de texto"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[fontSize]}
                  min={70}
                  max={150}
                  step={5}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Contraste
                  </Label>
                  <span className="text-sm">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  min={75}
                  max={125}
                  step={5}
                  onValueChange={(value) => setContrast(value[0])}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    <Sun className="h-4 w-4 mr-2" />
                    Brillo
                  </Label>
                  <span className="text-sm">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  min={75}
                  max={125}
                  step={5}
                  onValueChange={(value) => setBrightness(value[0])}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="flex items-center cursor-pointer">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Reducir movimiento
                  </Label>
                  <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="flex items-center cursor-pointer">
                    <Moon className="h-4 w-4 mr-2" />
                    Alto contraste
                  </Label>
                  <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dyslexic-font" className="flex items-center cursor-pointer">
                    <Type className="h-4 w-4 mr-2" />
                    Fuente para dislexia
                  </Label>
                  <Switch id="dyslexic-font" checked={dyslexicFont} onCheckedChange={setDyslexicFont} />
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer valores predeterminados
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos globales para accesibilidad */}
      <style jsx global>{`
        :root {
          --font-size-multiplier: 1;
          --contrast: 100%;
          --brightness: 100%;
        }

        html {
          filter: contrast(var(--contrast)) brightness(var(--brightness));
        }

        body {
          font-size: calc(1rem * var(--font-size-multiplier));
        }

        .dyslexic-font {
          font-family: 'Open Dyslexic', 'Comic Sans MS', sans-serif;
          letter-spacing: 0.05em;
          word-spacing: 0.1em;
          line-height: 1.5;
        }

        .high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --primary: #ffff00;
          --muted: #666666;
          --border: #ffffff;
        }

        .reduced-motion * {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
      `}</style>
    </>
  )
}
