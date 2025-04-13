export interface ImageSearchResult {
  id: string
  url: string
  thumbnailUrl: string
  description: string
  width: number
  height: number
  source: string
  authorName: string
  authorUrl: string
  downloadUrl: string
  tags: string[]
}

export interface ImageGalleryProps {
  muralId: string
  onSelectImage: (image: ImageSearchResult) => void
  onClose?: () => void
}
