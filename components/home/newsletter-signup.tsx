'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('Ingresa un correo para suscribirte');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo suscribir');
      }
      setStatus('ok');
      setMessage('¡Listo! Te avisaremos de las novedades más importantes.');
      setEmail('');
      setName('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'No se pudo suscribir');
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/30 blur-3xl" />
      <div className="relative container mx-auto px-4">
        <Card className="border-2 border-purple-100/60 dark:border-purple-900/60 shadow-2xl overflow-hidden">
          <div className="absolute right-8 top-6">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <CardContent className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center p-6 sm:p-10">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-300">
                <Mail className="w-4 h-4" />
                Novedades Calmify
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Suscríbete y recibe las nuevas meditaciones y talleres antes que nadie
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Un email curado con lanzamientos, retos semanales y recursos para tu calma consciente.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-800">
                  Etiqueta: suscriptor novedades
                </span>
                <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-800">
                  Sin spam · Puedes salirte cuando quieras
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Tu nombre (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700"
              >
                {status === 'loading' ? 'Enviando...' : 'Suscribirme'}
              </Button>
              {status === 'ok' && (
                <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {message || 'Suscripción confirmada'}
                </p>
              )}
              {status === 'error' && (
                <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {message || 'No pudimos suscribirte, intenta de nuevo'}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
