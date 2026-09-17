import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { useCategories, useConfig } from '../lib/hooks';

export default function Footer() {
  const { categories } = useCategories();
  const { config } = useConfig();
  const activeCategories = categories.filter(c => c.isActive);

  // Split categories into two arrays for 2-column layout in the footer
  const half = Math.ceil(activeCategories.length / 2);
  const leftColCategories = activeCategories.slice(0, half);
  const rightColCategories = activeCategories.slice(half);

  return (
    <footer className="bg-gray-100 text-brand-dark pt-16 pb-8 border-t-4 border-brand-red">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
        {/* Brand & About */}
        <div className="lg:col-span-4 lg:pr-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.jpg" alt="SAMOU MEDIA" className="w-12 h-12 object-contain" />
            <div className="text-3xl font-sans font-black tracking-tighter leading-none text-brand-red">
              SAMOU MÉDIA
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {config?.slogan || 'Premier média en ligne de Samou Benty et de Forécariah. Nous informons avec rigueur, valorisons notre communauté et racontons la Guinée au quotidien.'}
          </p>
          <div className="flex gap-2">
            <a href={config?.socials?.facebook} className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors">
              <Facebook size={16} />
            </a>
            <a href={config?.socials?.twitter} className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              <Twitter size={16} />
            </a>
            <a href={config?.socials?.youtube} className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors">
              <Youtube size={16} />
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-sm mb-6 text-brand-dark uppercase border-b-2 border-brand-red pb-2 inline-block">Newsletter</h3>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">Inscrivez-vous pour recevoir nos meilleurs reportages directement par e-mail.</p>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              try {
                const res = await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                if (res.ok) {
                  alert('Merci pour votre inscription !');
                  form.reset();
                } else {
                  alert('Erreur lors de l\'inscription.');
                }
              } catch (err) {
                alert('Erreur de connexion.');
              }
            }}
            className="flex flex-col gap-2"
          >
            <input type="email" name="email" placeholder="Votre adresse e-mail" required className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-brand-red focus:outline-none" />
            <button type="submit" className="w-full px-3 py-2 text-sm font-bold text-white bg-brand-red rounded hover:bg-red-700 transition-colors">S'abonner</button>
          </form>
        </div>

        {/* Rubriques */}
        <div className="lg:col-span-3">
          <h3 className="font-bold text-sm mb-6 text-brand-dark uppercase border-b-2 border-brand-red pb-2 inline-block">Rubriques</h3>
          <div className="flex gap-8">
            <ul className="space-y-3 text-sm text-gray-600 font-medium flex-1">
              {leftColCategories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/rubriques/${cat.slug}`} className="hover:text-brand-red transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-3 text-sm text-gray-600 font-medium flex-1">
              {rightColCategories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/rubriques/${cat.slug}`} className="hover:text-brand-red transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h3 className="font-bold text-sm mb-6 text-brand-dark uppercase border-b-2 border-brand-red pb-2 inline-block">Contact</h3>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <span className="font-medium">{config?.phone || '+224 625 80 87 66'}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-col font-medium">
                {config?.emails ? config.emails.map((email: string, idx: number) => <span key={idx}>{email}</span>) : (
                  <>
                    <span>SAMOUMEDIA.@gmail.com</span>
                    <span>Mohamedfof66@gmail.com</span>
                  </>
                )}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{config?.address || 'Bonfi Niger, Matam, Conakry'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-200 text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center font-medium">
        <p>© {new Date().getFullYear()} SAMOU MÉDIA - Tous droits réservés.</p>
        <p className="mt-2 md:mt-0">Conçu avec ❤️ en Guinée</p>
      </div>
    </footer>
  );
}
