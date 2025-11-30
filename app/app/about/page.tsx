export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/30 dark:via-purple-950/10 to-background py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-card border border-purple-100 dark:border-purple-900/40 rounded-3xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-8 space-y-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sobre mí
            </h1>
            <p className="text-lg text-muted-foreground">
              Hola, soy <strong>Rosa Delia</strong>. Soy madre, emprendedora, y una apasionada de ayudar a otras madres a encontrar calma, conexión y amor en su día a día. Mi historia comenzó como muchas de ustedes: con desafíos, estrés y la constante búsqueda de ser la mejor versión para mis hijas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Trabajé durante años como jefa de contabilidad en un ambiente lleno de estrés y autoexigencia. Sentía que estaba perdiéndome la infancia de mis hijas, atrapada en una rutina que no me permitía disfrutar de ellas ni de mí misma. Fue un brote severo de estrés lo que me obligó a detenerme, reflexionar y decidir: ¡esto tiene que cambiar!
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ahí descubrí el poder de los momentos simples. Peinar a mis hijas cada mañana se convirtió en nuestro espacio sagrado, donde no solo aprendíamos a crear peinados, sino también a construir un vínculo único. Fue en esos minutos diarios donde encontré calma, conexión y amor, y fue así como nació la idea de Escuela de Madres.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/50 border border-purple-100 dark:border-purple-900/40 shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-foreground">Mi misión</h3>
                <p className="text-sm text-muted-foreground">
                  Ayudarte, madre trabajadora y agotada, a descubrir que el cambio comienza con pequeños pasos. Mi método te enseña a reconectar contigo y con tus hijos a través de rutinas transformadoras.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/50 border border-purple-100 dark:border-purple-900/40 shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-foreground">¿Qué encontrarás?</h3>
                <p className="text-sm text-muted-foreground">
                  Técnicas sencillas de peinado, herramientas de autocuidado y rituales diarios para fortalecer autoestima, confianza y recuerdos felices con tus hij@s.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              He estado donde tú estás: cansancio, culpa y frustración. A través de mis cursos, talleres y herramientas, te acompaño a crear un cambio real y duradero en tu vida y en la de tus hijos.
            </p>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/40">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Un poco más sobre mí</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Amante del baile y la música: me ayudan a reconectar con mi esencia.</li>
                <li>Creo en el poder del amor, la calma y la conexión para cambiar el mundo.</li>
                <li>Mis momentos favoritos son las mañanas peinando a mis hij@s y compartiendo risas.</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              >
                Contactar
              </a>
              <a
                href="https://instagram.com/rosadeliacabreras"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-foreground hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
