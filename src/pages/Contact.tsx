import { MapPin, Mail, Phone, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-serif font-black tracking-tighter text-brand-dark mb-12 border-l-8 border-brand-red pl-4 uppercase">
        Contactez-nous
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <p className="text-xl text-gray-600 mb-8">
            Une question, une information à partager, ou une demande de partenariat ? Notre équipe est à votre disposition.
          </p>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 text-brand-red rounded-full flex items-center justify-center shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Téléphone</h3>
              <p className="text-gray-600 mt-1">+224 625 80 87 66</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-50 text-brand-yellow rounded-full flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Email</h3>
              <p className="text-gray-600 mt-1">SAMOUMEDIA.@gmail.com</p>
              <p className="text-gray-600">Mohamedfof66@gmail.com</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-50 text-brand-green rounded-full flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Adresse Physique</h3>
              <p className="text-gray-600 mt-1">Bonfi Niger, Matam</p>
              <p className="text-gray-600">Conakry, République de Guinée</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-brand-dark">Heures d'ouverture</h3>
              <p className="text-gray-600 mt-1">Lundi - Vendredi : 08h00 - 18h00</p>
              <p className="text-gray-600">Samedi : 09h00 - 14h00</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-brand-dark mb-6">Envoyez-nous un message</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="Votre prénom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="Votre nom" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="votre.email@exemple.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all" placeholder="Sujet de votre message" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
            </div>
            <button className="w-full bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors">
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
