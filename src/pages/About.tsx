export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-serif font-black tracking-tighter text-brand-dark mb-8 border-l-8 border-brand-red pl-4 uppercase">
        À propos de nous
      </h1>
      
      <div className="prose prose-lg prose-red max-w-none text-gray-800">
        <p className="text-xl font-medium leading-relaxed mb-8">
          Bienvenue sur <strong>SAMOU MÉDIA</strong>, "La voix de Samou, le regard sur le monde."
        </p>
        
        <p className="mb-6">
          Nous sommes un média d'information générale, indépendant et engagé, basé à Bonfi, Matam. Notre mission principale se résume en trois mots : <strong>Informer, Éclairer, Rassembler</strong>.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 font-serif">Notre Mission</h2>
        <p className="mb-6">
          Samou Média a été créé avec pour ambition de devenir une référence incontournable de l'information en Guinée, et plus particulièrement dans la préfecture de Forécariah (Samou Benty). Nous croyons au pouvoir de l'information pour transformer la société, éduquer les masses et donner une voix à ceux qui n'en ont pas.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 font-serif">Notre Équipe</h2>
        <p className="mb-6">
          Dirigée par <strong>Mohamed Fofana</strong>, notre équipe est composée de journalistes professionnels, de correspondants locaux et de techniciens passionnés, dévoués à la recherche de la vérité.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-8">
          <h3 className="text-xl font-bold mb-3 font-serif">Notre Engagement</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Une information vérifiée, rigoureuse et impartiale.</li>
            <li>Une couverture approfondie de l'actualité locale, nationale et internationale.</li>
            <li>Un espace de débat et d'analyse pour éclairer l'opinion publique.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
