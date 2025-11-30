'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  Search,
  Menu,
  X,
  Home,
  Headphones,
  Heart,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Shield,
  List,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN' || session?.user?.isAdmin
  const isCollaborator = role === 'COLLABORATOR'

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (res.ok) {
        setShowDeleteDialog(false)
        await signOut({ callbackUrl: '/' })
      } else {
        const data = await res.json()
        alert(data.error || 'No se pudo eliminar la cuenta.')
      }
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la cuenta.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  // Helper para determinar si un link está activo
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Con padding mejorado */}
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <div className="h-14 w-14 flex items-center justify-center">
              <Image
                src="/icon-192x192.png"
                alt="Calmify"
                width={52}
                height={52}
                priority
                className="rounded-2xl shadow-md"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline-block drop-shadow-sm">
              Calmify
            </span>
          </Link>

          {/* Desktop Navigation - Centrado */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
            <Link
              href="/"
              className={cn(
                "text-sm font-semibold transition-all duration-200 hover:text-primary relative py-2",
                isActive('/')
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:via-purple-500 after:to-pink-500 after:rounded-full"
                  : "text-muted-foreground"
              )}
            >
              Inicio
            </Link>
            <Link
              href="/categories"
              className={cn(
                "text-sm font-semibold transition-all duration-200 hover:text-primary relative py-2",
                isActive('/categories')
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:via-purple-500 after:to-pink-500 after:rounded-full"
                  : "text-muted-foreground"
              )}
            >
              Categorías
            </Link>
            {session && (
              <>
                <Link
                  href="/favorites"
                  className={cn(
                    "text-sm font-semibold transition-all duration-200 hover:text-primary relative py-2",
                    isActive('/favorites')
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:via-purple-500 after:to-pink-500 after:rounded-full"
                      : "text-muted-foreground"
                  )}
                >
                  Favoritos
                </Link>
                <Link
                  href="/playlists"
                  className={cn(
                    "text-sm font-semibold transition-all duration-200 hover:text-primary relative py-2",
                    isActive('/playlists')
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:via-purple-500 after:to-pink-500 after:rounded-full"
                      : "text-muted-foreground"
                  )}
                >
                  Playlists
                </Link>
              </>
            )}
          </nav>

          {/* Right Section - Theme + User */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
              <span className="sr-only">Cambiar tema</span>
            </Button>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0 ring-2 ring-transparent hover:ring-purple-500/50 transition-all"
                    aria-haspopup="true"
                    aria-label="Menú de usuario"
                  >
                    <Avatar className="h-9 w-9 border-2 border-purple-500/20">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || 'Usuario'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favoritos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/playlists" className="flex items-center cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>Playlists</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories" className="flex items-center cursor-pointer">
                      <Headphones className="mr-2 h-4 w-4" />
                      <span>Categorías</span>
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin || isCollaborator) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Eliminar cuenta</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild className="font-semibold">
                  <Link href="/auth">Iniciar sesión</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 font-semibold">
                  <Link href="/auth">Registrarse</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive('/')
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                    : "hover:bg-purple-50 dark:hover:bg-purple-950/20 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Inicio</span>
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive('/categories')
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                    : "hover:bg-purple-50 dark:hover:bg-purple-950/20 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Headphones className="h-5 w-5" />
                <span>Categorías</span>
              </Link>
              {session && (
                <>
                  <Link
                    href="/favorites"
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive('/favorites')
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                        : "hover:bg-purple-50 dark:hover:bg-purple-950/20 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Favoritos</span>
                  </Link>
                  <Link
                    href="/playlists"
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive('/playlists')
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                        : "hover:bg-purple-50 dark:hover:bg-purple-950/20 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <List className="h-5 w-5" />
                    <span>Playlists</span>
                  </Link>
                </>
              )}
              {(isAdmin || isCollaborator) && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive('/admin')
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                      : "hover:bg-purple-50 dark:hover:bg-purple-950/20 text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  <span>Panel Admin</span>
                </Link>
              )}
            </nav>

            {/* Mobile Auth Buttons */}
            {!session && (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="outline" asChild className="w-full justify-start font-semibold">
                  <Link href="/auth">
                    <User className="mr-2 h-4 w-4" />
                    Iniciar sesión
                  </Link>
                </Button>
                <Button asChild className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 font-semibold">
                  <Link href="/auth">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </span>
            Eliminar cuenta
          </DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. Se eliminarán tus datos, playlists y comentarios. ¿Deseas continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-500 hover:from-red-700 hover:via-pink-700 hover:to-orange-600"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
