export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground">
          Esta página resume cómo Calmify trata tus datos personales. No vendemos tu información y solo la usamos para operar la plataforma y mejorar tu experiencia.
        </p>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Datos de cuenta: nombre, email, contraseña (encriptada), rol.</li>
              <li>Uso de la plataforma: playlists, favoritos, comentarios, reproducciones.</li>
              <li>Datos técnicos: IP, tipo de dispositivo, navegador (para seguridad y métricas básicas).</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Para qué los usamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Autenticación y seguridad de la cuenta.</li>
              <li>Recomendaciones y personalización de contenido.</li>
              <li>Comunicación de soporte y avisos importantes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Con quién los compartimos</h2>
            <p>Solo con proveedores necesarios (hosting, email, analítica básica) bajo acuerdos de protección de datos.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Tus derechos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acceder, rectificar o eliminar tus datos.</li>
              <li>Retirar consentimiento de comunicaciones.</li>
              <li>Eliminar tu cuenta desde el perfil o solicitándolo a hola@rosadeliacabrera.com.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
            <p>Para cualquier solicitud de datos escribe a <a className="underline" href="mailto:hola@rosadeliacabrera.com">hola@rosadeliacabrera.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
