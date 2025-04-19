"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { ImageGallery } from "@/components/image-gallery"
import type { ImageSearchResult } from "@/types/image"

interface ImageGalleryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  muralId: string
  onSelectImage: (image: ImageSearchResult) => void
}

export function ImageGalleryDialog({ open, onOpenChange, muralId, onSelectImage }: ImageGalleryDialogProps) {
  const handleSelectImage = (image: ImageSearchResult) => {
    onSelectImage(image)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Galería de imágenes
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona imágenes para añadir a tu mural.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[70vh]">
          <ImageGallery muralId={muralId} onSelectImage={handleSelectImage} onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
