export interface Media {
  id: string
  filename: string
  key: string
  url: string
  thumbnailUrl: string
  size: number
  mimeType: string
  type: string
  alt: string
  title: string
  description: string
  width: number
  height: number
  uploadedBy: string
  uploadedAt: string
  isActive: boolean
  isPublic: boolean
  tags: string[]
  folder: string
  referenceId: string
  createdAt: string
  updatedAt: string
}
