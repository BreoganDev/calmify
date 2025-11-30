'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Brain, Mail, Lock, User, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export function AuthContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams?.get('callbackUrl') || '/';
      router.push(callbackUrl);
    }
  }, [status, router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: searchParams?.get('callbackUrl') || '/' });
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Credenciales invalidas o correo no verificado.');
        } else {
          toast.success('Bienvenido de vuelta!');
          const callbackUrl = searchParams?.get('callbackUrl') || '/';
          router.push(callbackUrl);
        }
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Cuenta creada. Revisa tu correo para confirmar.');
          setIsLogin(true);
        } else {
          setError(data.error || 'Error al crear la cuenta');
        }
      }
    } catch (err) {
      setError('Error de conexion. Intentalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-900 bg-card/95 backdrop-blur-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <CardHeader className="text-center pb-8 pt-8">
            <div className="relative mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl animate-pulse overflow-hidden">
              <img src="/icon-192x192.png" alt="Calmify" className="h-10 w-10 object-contain" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Bienvenido a Calmify' : 'Unete a Calmify'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin
                ? 'Ingresa para continuar tu journey de bienestar'
                : 'Crea tu cuenta y comienza tu transformacion'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </Button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Minimo 6 caracteres
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isLogin ? 'Iniciar Sesion' : 'Crear Cuenta'}
              </Button>

              <div className="relative py-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-dashed border-purple-200 dark:border-purple-800" />
                </div>
                <div className="relative px-2 text-xs uppercase tracking-wide text-muted-foreground bg-card w-fit mx-auto">
                  o continua con
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full h-11 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center gap-2 hover:border-purple-300 dark:hover:border-purple-700"
              >
                <Chrome className="h-5 w-5 text-purple-600" />
                <span>Google</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {isLogin ? 'No tienes cuenta?' : 'Ya tienes cuenta?'}
              </p>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '' });
                }}
              >
                {isLogin ? 'Crear cuenta gratuita' : 'Iniciar sesion'}
              </Button>
            </div>
          </CardContent>

          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        </Card>
      </motion.div>
    </div>
  );
}
