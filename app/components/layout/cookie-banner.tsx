'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_NAME = 'calmify_cookie_consent'

function hasConsent(): boolean {
  if (typeof document === 'undefined') return true
  return document.cookie.split('; ').some((c) => c.startsWith(`${CONSENT_NAME}=`))
}

function setConsent(value: 'accepted' | 'rejected') {
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `${CONSENT_NAME}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasConsent())
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto max-w-4xl rounded-2xl bg-card border border-purple-100 dark:border-purple-900/40 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Usamos cookies</p>
          <p>
            Utilizamos cookies esenciales y de preferencias para que Calmify funcione y mejorar tu experiencia. Lee más en nuestra{' '}
            <Link href="/cookies" className="underline text-purple-600 dark:text-purple-300 hover:text-purple-700">
              política de cookies
            </Link>.
          </p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={() => {
              setConsent('rejected')
              setVisible(false)
            }}
            className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-sm font-semibold hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={() => {
              setConsent('accepted')
              setVisible(false)
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg hover:shadow-xl transition-transform hover:scale-105"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
