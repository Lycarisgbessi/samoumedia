import { useState, type FormEvent } from 'react';
import { MapPin, Mail, Phone, Clock, MessageCircle, Send, Facebook, Youtube, Navigation, Copy, Check } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { useConfig } from '../lib/hooks';

export default function Contact() {
  const { config } = useConfig();
  const [copied, setCopied] = useState('');

  // Données de contact : issues des Réglages du tableau de bord (avec repli)
  const emails = (config?.emails?.length ? config.emails : ['SAMOUMEDIA.@gmail.com', 'Mohamedfof66@gmail.com'])
    .map(e => e.trim()).filter(Boolean);
  const phone = config?.phone || '+224 625 80 87 66';
  const phoneDigits = phone.replace(/[^+\d]/g, ''); // +224625808766
  const address = config?.address || 'Bonfi Niger, Matam';
  const whatsapp = (config?.socials?.whatsapp || '').includes('wa.me')
    ? config.socials.whatsapp
    : `https://wa.me/${phoneDigits.replace('+', '')}`;
  const facebook = config?.socials?.facebook;
  const youtube = config?.socials?.youtube;

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(''), 1500);
    }).catch(() => { });
  };

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  // Le formulaire compose un email pré-rempli vers la rédaction (ouverture de
  // la messagerie du visiteur) — fonctionne sans aucun service externe.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const to = emails[0];
    const subject = encodeURIComponent(form.subject || `Message de ${form.name || 'un visiteur'}`);
    const body = encodeURIComponent(
      `${form.message}\n\n—\n${form.name || ''}${form.email ? ` (${form.email})` : ''}\nEnvoyé depuis www.samoumedia.com`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-[60vh]">
      {/* Bandeau d'en-tête */}
      <div className="bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <Reveal>
            <span className="inline-block bg-brand-red text-white text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-sm mb-5">
              {config?.name || 'SAMOU MÉDIA'}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter leading-tight mb-4">
              Contactez la rédaction
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Une info à nous transmettre ? Un témoignage, une demande de partenariat ou de publicité ?
              Écrivez-nous directement — tous les canaux ci-dessous sont actifs.
            </p>
          </Reveal>

          {/* Actions rapides */}
          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={`mailto:${emails[0]}?subject=${encodeURIComponent('Contact depuis le site')}`}
                 className="flex items-center gap-2 bg-brand-red hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg transition-colors shadow-lg">
                <Mail size={18} /> Écrire un email
              </a>
              <a href={`tel:${phoneDigits}`}
                 className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg transition-colors">
                <Phone size={18} /> Appeler
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1fa855] text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-lg transition-colors">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Toutes les adresses email — cliquables */}
        <Reveal className="lg:col-span-3 space-y-5">
          <h2 className="text-2xl font-serif font-black text-brand-dark uppercase flex items-center gap-3">
            <span className="w-8 h-1 bg-brand-red" /> Nos adresses email
          </h2>
          <p className="text-gray-500 text-sm -mt-3">Cliquez sur une adresse : votre messagerie s'ouvre directement avec le destinataire prêt.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emails.map((email, i) => (
              <a key={email + i} href={`mailto:${email}?subject=${encodeURIComponent('Contact depuis www.samoumedia.com')}`}
                 className="group bg-white border border-gray-100 hover:border-brand-red rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0 group-hover:bg-brand-red group-hover:text-white transition-colors">
                  <Mail size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Email {emails.length > 1 ? i + 1 : 'de la rédaction'}</p>
                  <p className="font-bold text-gray-900 truncate group-hover:text-brand-red transition-colors break-all">{email}</p>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); copy(email); }}
                  title="Copier l'adresse"
                  className="ml-auto p-2 text-gray-300 hover:text-brand-red transition-colors shrink-0"
                >
                  {copied === email ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </a>
            ))}
          </div>

          {/* Téléphone + adresse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a href={`tel:${phoneDigits}`}
               className="group bg-white border border-gray-100 hover:border-brand-green rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-brand-green flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Téléphone — cliquez pour appeler</p>
                <p className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">{phone}</p>
              </div>
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Conakry, Guinée')}`}
               target="_blank" rel="noopener noreferrer"
               className="group bg-white border border-gray-100 hover:border-brand-yellow rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 text-brand-yellow flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Adresse — ouvrir dans Maps</p>
                <p className="font-bold text-gray-900">{address}, Conakry — Guinée</p>
              </div>
            </a>
          </div>

          {/* Réseaux */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Navigation size={14} /> Suivez-nous :</span>
            {facebook && facebook !== '#' && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2] text-white text-xs font-black uppercase px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <Facebook size={15} /> Facebook
              </a>
            )}
            {youtube && youtube !== '#' && (
              <a href={youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF0000] text-white text-xs font-black uppercase px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                <Youtube size={15} /> YouTube
              </a>
            )}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-black uppercase px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </Reveal>

        {/* Formulaire → compose un email pré-rempli */}
        <Reveal delay={0.1} className="lg:col-span-2">
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 sticky top-24">
            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-2">Envoyez-nous un message</h2>
            <p className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
              <Send size={13} /> À l'envoi, votre messagerie s'ouvre avec le message prêt à partir.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="vous@exemple.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="Sujet de votre message" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>
              <button type="submit" className="w-full bg-brand-red text-white font-black py-3.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                <Send size={16} /> Envoyer le message
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 mt-4 flex items-start gap-3">
            <Clock size={18} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-bold text-gray-800">Heures de la rédaction</p>
              <p>Lundi – Vendredi : 08h00 – 18h00 · Samedi : 09h00 – 14h00</p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
