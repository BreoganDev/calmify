
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        if (!user.emailVerified) {
          // Bloquea login hasta que verifique correo
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          isAdmin: token.role === 'ADMIN',
        }
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user?.email) return

      const isGoogle = account?.provider === 'google'
      const userDb = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, createdAt: true, emailVerified: true, role: true, name: true },
      })

      // Marcar verificado si viene por Google
      if (isGoogle && userDb && !userDb.emailVerified) {
        await prisma.user.update({
          where: { email: user.email },
          data: { emailVerified: new Date() },
        })
      }

      // CRM y tracking
      try {
        const { ensureContact } = await import('@/lib/crm')
        const { logEvent } = await import('@/lib/analytics')
        const { sendWelcomeEmail, sendAdminNewUserEmail } = await import('@/lib/email')

        await ensureContact({
          userId: userDb?.id,
          email: user.email,
          name: userDb?.name || undefined,
          role: userDb?.role || 'USER',
        })

        const createdAtMs = userDb?.createdAt ? new Date(userDb.createdAt).getTime() : 0
        const isRecent = userDb ? (Date.now() - createdAtMs < 2 * 60 * 1000) : true
        const isNew = !userDb || isRecent || (isGoogle && !userDb?.emailVerified)

        if (isNew) {
          await Promise.allSettled([
            sendWelcomeEmail(user.email, userDb?.name || undefined),
            sendAdminNewUserEmail({ email: user.email, name: userDb?.name || undefined }),
            logEvent('SIGNUP', { userId: userDb?.id, metadata: { email: user.email, provider: account?.provider } }),
          ])
        } else {
          await logEvent('LOGIN', { userId: userDb?.id, metadata: { email: user.email, provider: account?.provider } })
        }
      } catch (err) {
        console.warn('signIn event tracking failed', err)
      }
    },
  },
}
