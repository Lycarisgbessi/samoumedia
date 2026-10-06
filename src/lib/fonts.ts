// Polices d'écriture proposées dans l'éditeur d'articles.
// Les familles correspondantes sont chargées dans index.css (Google Fonts).

export interface FontOption {
  // Valeur stockée en base = pile CSS complète
  value: string;
  label: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: '', label: 'Police du site — Roboto (défaut)' },
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display — élégant, titres de presse' },
  { value: 'Merriweather, Georgia, serif', label: 'Merriweather — lecture longue, sérieux' },
  { value: 'Lora, Georgia, serif', label: 'Lora — littéraire, doux' },
  { value: 'Oswald, sans-serif', label: 'Oswald — condensé, impact' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat — moderne, épuré' },
  { value: 'Poppins, sans-serif', label: 'Poppins — rond, amical' },
  { value: "'Bebas Neue', sans-serif", label: 'Bebas Neue — grands titres dramatiques' },
];
