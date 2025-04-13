"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
            Galería de imágenes
          </DialogTitle>
        </DialogHeader>
        <div className="h-[70vh]">
          <ImageGallery muralId={muralId} onSelectImage={handleSelectImage} onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
