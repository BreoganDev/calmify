
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'USER' | 'ADMIN' | 'COLLABORATOR'
      isAdmin?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: 'USER' | 'ADMIN' | 'COLLABORATOR'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: 'USER' | 'ADMIN' | 'COLLABORATOR'
  }
}
