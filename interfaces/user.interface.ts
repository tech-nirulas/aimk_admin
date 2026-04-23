import { Localization } from "./localization.interface"
import { Role } from "./role.interface"

export interface User {
  id: string
  documentId: string
  firstname: string
  lastname: string
  username: string
  email: string
  resetPasswordToken: string
  registrationToken: string
  isActive: boolean
  roles: Role[]
  blocked: boolean
  preferedLanguage: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  createdBy: User
  updatedBy: User
  locale: string
  localizations: Localization[]
}