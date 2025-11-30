'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Instagram, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t bg-gradient-to-b from-background to-muted/20">
      {/* Wave decoration */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: '1px' }}>
        <svg
          className="relative block w-full"
          viewBox="0 0 1200 12"
          preserveAspectRatio="none"
          style={{ height: '12px', transform: 'translateY(-11px)' }}
        >
          <path
            d="M0,0 C300,12 900,12 1200,0 L1200,12 L0,12 Z"
            className="fill-purple-500/20"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-12 w-12 flex items-center justify-center">
                <Image src="/icon-192x192.png" alt="Calmify" width={44} height={44} className="object-contain rounded-2xl shadow-md" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                Calmify
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu compañero para una calma consciente. Descubre podcasts inspiradores, meditaciones profundas y sesiones de reconexión.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://instagram.com/rosadeliacabreras"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-muted hover:bg-purple-100 dark:hover:bg-purple-900/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </a>
              <a
                href="mailto:hola@rosadeliacabrera.com"
                className="h-9 w-9 rounded-full bg-muted hover:bg-purple-100 dark:hover:bg-purple-900/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </a>
            </div>
          </div>

          {/* Contenido */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-foreground">Contenido</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Categorías</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/playlists"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Playlists</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Favoritos</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Acerca de */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-foreground">Acerca de</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Sobre mí</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Contacto</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Privacidad</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Términos de uso</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-200 flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Cookies</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Calmify. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>para madres conscientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </footer>
  )
}
