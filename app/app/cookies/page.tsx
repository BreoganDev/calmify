export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Política de Cookies
        </h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Calmify usa cookies para mejorar tu experiencia. Puedes controlarlas desde la configuración de tu navegador.</p>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Qué cookies usamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Esenciales: necesarias para iniciar sesión y mantener la sesión.</li>
              <li>Preferencias: recuerdan tu tema (claro/oscuro) y ajustes de idioma.</li>
              <li>Analítica básica: para entender uso general y mejorar la plataforma.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Cómo gestionarlas</h2>
            <p>Puedes borrar o bloquear cookies desde tu navegador. Deshabilitar cookies esenciales puede impedir el inicio de sesión.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
            <p>Si tienes dudas sobre cookies, escríbenos a <a className="underline" href="mailto:hola@rosadeliacabrera.com">hola@rosadeliacabrera.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
