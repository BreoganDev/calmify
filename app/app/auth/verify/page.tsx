import React, { Suspense } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

function VerifyContent() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const token = params.get('token')

  const message = (status: 'loading' | 'success' | 'error', text: string) => (
    <div className="flex flex-col items-center text-center space-y-4">
      {status === 'success' ? (
        <div className="p-3 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-100">
          <CheckCircle className="h-8 w-8" />
        </div>
      ) : status === 'error' ? (
        <div className="p-3 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-100">
          <AlertTriangle className="h-8 w-8" />
        </div>
      ) : null}
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  )

  if (!token) {
    return message('error', 'Token no encontrado. Revisa tu correo y usa el enlace enviado.')
  }

  return (
    <VerifyCall token={token} message={message} />
  )
}

function VerifyCall({ token, message }: { token: string; message: (s: any, t: string) => JSX.Element }) {
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading')

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch (err) {
        setStatus('error')
      }
    }
    run()
  }, [token])

  if (status === 'success') {
    return message('success', 'Correo verificado. Ya puedes iniciar sesión.')
  }
  if (status === 'error') {
    return message('error', 'El enlace no es válido o expiró. Solicita un nuevo registro.')
  }
  return message('loading', 'Verificando tu correo...')
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-purple-50/40 dark:via-purple-950/20 to-background px-4">
      <div className="max-w-md w-full bg-card border border-purple-100 dark:border-purple-900/40 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
          Verificación de correo
        </h1>
        <Suspense fallback={<p className="text-center text-muted-foreground">Cargando...</p>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  )
}
