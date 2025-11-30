export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Términos de Uso
        </h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Al usar Calmify aceptas estos términos. Si no estás de acuerdo, por favor no uses la plataforma.</p>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Cuenta y acceso</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Debes proporcionar información veraz y mantener la seguridad de tu contraseña.</li>
              <li>Puedes eliminar tu cuenta en cualquier momento desde tu perfil o pidiéndolo a soporte.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Uso permitido</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>No está permitido copiar, redistribuir o usar el contenido con fines comerciales sin permiso.</li>
              <li>Evita subir o compartir material ofensivo, ilegal o que infrinja derechos de autor.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Contenido y disponibilidad</h2>
            <p>Podemos modificar o retirar contenidos y funciones. Intentamos garantizar disponibilidad, pero no aseguramos funcionamiento ininterrumpido.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Limitación de responsabilidad</h2>
            <p>Calmify se ofrece “tal cual”. No somos responsables por daños indirectos derivados del uso de la plataforma.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
            <p>Para dudas sobre estos términos, escribe a <a className="underline" href="mailto:hola@rosadeliacabrera.com">hola@rosadeliacabrera.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
