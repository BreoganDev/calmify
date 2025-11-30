'use client';

import { useState } from 'react';
import { Mail, PhoneCall, Calendar } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hablemos
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Elige cómo quieres contactar: envíame un mensaje o agenda una llamada rápida. Respondo desde{' '}
            <strong>hola@rosadeliacabrera.com</strong>.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="p-6 rounded-3xl bg-card border border-purple-100 dark:border-purple-900/40 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Formulario de contacto</h2>
                <p className="text-sm text-muted-foreground">Te responderé lo antes posible</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                className="w-full rounded-xl border border-purple-100 dark:border-purple-800 bg-background px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-purple-100 dark:border-purple-800 bg-background px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <textarea
                className="w-full rounded-xl border border-purple-100 dark:border-purple-800 bg-background px-4 py-3 min-h-[140px] focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Cuéntame qué necesitas..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="flex gap-3">
                <a
                  href={`mailto:hola@rosadeliacabrera.com?subject=Contacto Calmify&body=Nombre: ${encodeURIComponent(form.name)}%0AEmail: ${encodeURIComponent(form.email)}%0AMensaje: ${encodeURIComponent(form.message)}`}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
                >
                  Enviar mensaje
                </a>
                <a
                  href="mailto:hola@rosadeliacabrera.com"
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-800 text-foreground hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                >
                  Escribir desde tu email
                </a>
              </div>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-purple-100 dark:border-purple-900/40 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Agendar llamada</h2>
                <p className="text-sm text-muted-foreground">Reserva un espacio en mi calendario</p>
              </div>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Elige un momento y crearemos una cita en Google Calendar con tus datos.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-purple-100 dark:border-purple-800 p-3 bg-white/50 dark:bg-gray-900/40">
                  <p className="text-sm font-semibold text-foreground">Paso 1</p>
                  <p className="text-sm">Pulsa “Agendar en Google Calendar”.</p>
                </div>
                <div className="rounded-xl border border-purple-100 dark:border-purple-800 p-3 bg-white/50 dark:bg-gray-900/40">
                  <p className="text-sm font-semibold text-foreground">Paso 2</p>
                  <p className="text-sm">Selecciona fecha y confirma la cita.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sesión%20con%20Rosa%20Delia&details=Completa%20el%20formulario%20o%20envía%20un%20correo%20a%20hola@rosadeliacabrera.com&location=Online"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Agendar en Google Calendar
              </a>
              <a
                href="tel:+"
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-800 text-foreground hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Prefiero que me llamen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
