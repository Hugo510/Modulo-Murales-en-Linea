// Tipos de permisos para murales
export type PermissionRole = "owner" | "editor" | "commenter" | "viewer"

// Interfaz para un permiso individual
export interface Permission {
  id: string
  userId: string
  userEmail: string
  userName: string
  userAvatar?: string
  role: PermissionRole
  addedAt: Date
  addedBy: string
}

// Interfaz para estilos de elementos
export interface ItemStyle {
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

// Interfaz para actividades educativas
export interface EducationalActivity {
  type: "individual" | "group" | "collaborative" | "presentation" | "assessment"
  dueDate?: Date
  duration?: number
  instructions?: string
  allowLateSubmissions?: boolean
  requiresReview?: boolean
  maxParticipants?: number
  notifyOnSubmission?: boolean
  gradeEnabled?: boolean
  maxGrade?: number
  status?: "draft" | "published" | "in_progress" | "completed" | "archived"
  assignedTo?: string[]
  submissions?: {
    userId: string
    submittedAt: Date
    status: "submitted" | "reviewed" | "graded"
    grade?: number
    feedback?: string
  }[]
}

// Interfaz para un grupo de elementos
export interface ItemGroup {
  id: string
  name: string
  color: string
  itemIds: string[]
  createdAt: Date
  createdBy: string
}

// Interfaz para un mural
export interface Mural {
  id: string
  title: string
  description: string
  color: string
  background?: string
  layout: "grid" | "masonry"
  isPublic: boolean
  allowComments: boolean
  allowEditing: boolean
  createdAt: Date
  updatedAt: Date
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  permissions: Permission[]
  items: MuralItem[]
  groups?: ItemGroup[]
  views: number
  lastViewed?: Date
  tags?: string[]
  category?: string
  isFavorite?: boolean
  itemStyle?: ItemStyle
  educationalActivity?: EducationalActivity
  template?: string
}

// Interfaz para un elemento del mural
export interface MuralItem {
  id: string
  type: "text" | "image" | "link" | "video" | "file"
  content: string
  title?: string
  description?: string
  caption?: string
  position: { x: number; y: number }
  color?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  style?: ItemStyle
  tags?: string[]
}

// Interfaz para filtros de murales
export interface MuralFilters {
  view: "all" | "owned" | "shared" | "favorites" | "recent"
  sort: "recent" | "name" | "oldest"
  category?: string
  search?: string
}
