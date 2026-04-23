import { Localization } from "./localization.interface"
import { Permission } from "./permission.interface"
import { User } from "./user.interface"

export interface Role {
  id: string
  documentId: string
  name: string
  code: string
  description: string
  users: User[]
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  publishedAt: string
  createdBy: User
  updatedBy: User
  locale: string
  localizations: Localization[]
}