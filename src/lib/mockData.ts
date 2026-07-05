export const categories = [
  { id: 'national', name: 'National', isActive: true, order: 1 },
  { id: 'politique', name: 'Politique', isActive: true, order: 2 },
  { id: 'societe', name: 'Société', isActive: true, order: 3 },
  { id: 'economie', name: 'Économie', isActive: true, order: 4 },
  { id: 'justice', name: 'Justice', isActive: true, order: 5 },
  { id: 'mines', name: 'Mines', isActive: true, order: 6 },
  { id: 'culture', name: 'Culture', isActive: true, order: 7 },
  { id: 'sport', name: 'Sport', isActive: true, order: 8 },
  { id: 'education', name: 'Éducation', isActive: true, order: 9 },
  { id: 'sante', name: 'Santé', isActive: true, order: 10 },
  { id: 'environnement', name: 'Environnement', isActive: true, order: 11 },
  { id: 'samou-benty', name: 'Samou Benty', isActive: true, order: 12 },
  { id: 'forecariah', name: 'Forecariah', isActive: true, order: 13 },
  { id: 'international', name: 'International', isActive: true, order: 14 },
];

let baseArticles = [
  {
    id: '1',
    title: 'Le Président nomme 20 ministres ce lundi',
    excerpt: 'Un nouveau gouvernement pour accélérer les réformes et répondre aux attentes des Guinéens.',
    content: 'Le président a procédé à un remaniement majeur. Ce nouveau gouvernement aura pour mission principale de poursuivre les réformes engagées et de répondre aux attentes pressantes de la population en matière de pouvoir d\'achat et d\'infrastructures.',
    imageUrl: 'https://picsum.photos/seed/samou1/800/600',
    categoryId: 'politique',
    author: 'Mohamed Fofana',
    date: new Date().toISOString(),
    readTime: '5 min',
    isFeatured: true,
    views: 1250
  },
  {
    id: '2',
    title: 'Samou Benty : les jeunes lancent une opération de salubrité',
    excerpt: 'Une initiative citoyenne pour assainir la commune...',
    content: 'Dès les premières heures de la matinée, des centaines de jeunes se sont mobilisés dans les rues de Samou Benty pour une vaste opération de nettoyage. Armés de pelles, de râteaux et de brouettes, ils ont curé les caniveaux et ramassé les ordures qui jonchaient les voies publiques.',
    imageUrl: 'https://picsum.photos/seed/samou2/800/600',
    categoryId: 'samou-benty',
    author: 'Rédaction',
    date: new Date(Date.now() - 86400000).toISOString(),
    readTime: '3 min',
    isFeatured: true,
    views: 890
  },
  {
    id: '3',
    title: 'Hausse du prix de l\'or : quelles conséquences pour la Guinée ?',
    excerpt: 'Analyse des impacts économiques sur le secteur minier guinéen.',
    content: 'Le cours de l\'or a atteint des sommets historiques sur les marchés internationaux. Cette flambée des prix représente une opportunité inespérée pour l\'économie guinéenne, fortement dépendante du secteur minier. Cependant, les experts appellent à la prudence et à une meilleure redistribution des revenus générés.',
    imageUrl: 'https://picsum.photos/seed/samou3/800/600',
    categoryId: 'economie',
    author: 'Expert Éco',
    date: new Date(Date.now() - 172800000).toISOString(),
    readTime: '6 min',
    isFeatured: true,
    views: 2100
  },
  {
    id: '4',
    title: 'Ouverture du procès des événements du 28 septembre',
    excerpt: 'Une étape cruciale pour la justice guinéenne.',
    content: 'Le tribunal a ouvert ses portes ce matin sous haute sécurité. Les victimes et leurs familles attendent que la lumière soit enfin faite sur les tragiques événements de 2009. Ce procès historique est perçu comme un test majeur pour l\'indépendance et l\'impartialité du système judiciaire guinéen.',
    imageUrl: 'https://picsum.photos/seed/samou4/800/600',
    categoryId: 'justice',
    author: 'Correspondant',
    date: new Date(Date.now() - 259200000).toISOString(),
    readTime: '8 min',
    isFeatured: true,
    views: 3400
  },
  {
    id: '5',
    title: 'Le gouvernement engage de nouvelles mesures pour soutenir le pouvoir d\'achat',
    excerpt: 'Des décisions visant à soulager les populations face à la vie chère.',
    content: 'Le Premier ministre a annoncé hier soir un train de mesures destinées à atténuer les effets de l\'inflation. Parmi celles-ci figurent la subvention de certains produits de première nécessité et la réduction des taxes sur les carburants. Ces annonces ont été accueillies avec un mélange de soulagement et de scepticisme par les syndicats.',
    imageUrl: 'https://picsum.photos/seed/samou5/800/600',
    categoryId: 'national',
    author: 'Rédaction',
    date: new Date(Date.now() - 50000000).toISOString(),
    readTime: '4 min',
    isFeatured: false,
    views: 1500
  },
  {
    id: '6',
    title: 'Nouveau projet de développement pour Forécariah',
    excerpt: 'Des investissements massifs prévus pour moderniser les infrastructures locales.',
    content: 'La préfecture de Forécariah va bénéficier d\'un programme de développement ambitieux. Les fonds alloués serviront à réhabiliter les routes principales, construire de nouveaux centres de santé et étendre le réseau électrique aux villages reculés.',
    imageUrl: 'https://picsum.photos/seed/samou6/800/600',
    categoryId: 'forecariah',
    author: 'Local News',
    date: new Date(Date.now() - 60000000).toISOString(),
    readTime: '4 min',
    isFeatured: true,
    views: 1100
  },
  {
    id: '7',
    title: 'La CAN 2025: L\'équipe nationale se prépare activement',
    excerpt: 'Les joueurs se rassemblent pour les derniers matchs de préparation.',
    content: 'À quelques mois du coup d\'envoi de la compétition continentale, l\'entraîneur a dévoilé la liste des joueurs retenus pour le stage de préparation. L\'objectif est clair : ramener la coupe à la maison et faire la fierté de toute une nation.',
    imageUrl: 'https://picsum.photos/seed/samou7/800/600',
    categoryId: 'sport',
    author: 'Chroniqueur Sportif',
    date: new Date(Date.now() - 70000000).toISOString(),
    readTime: '3 min',
    isFeatured: true,
    views: 4500
  },
  {
    id: '8',
    title: 'Nouvelle politique d\'exploitation minière responsable',
    excerpt: 'Le ministère annonce un cadre plus strict pour la protection de l\'environnement.',
    content: 'Face aux critiques croissantes concernant l\'impact écologique de l\'extraction minière, le gouvernement impose de nouvelles normes environnementales aux sociétés exploitantes. Celles-ci devront désormais s\'engager dans des plans de reboisement et de gestion durable de l\'eau.',
    imageUrl: 'https://picsum.photos/seed/samou8/800/600',
    categoryId: 'mines',
    author: 'Environnement Info',
    date: new Date(Date.now() - 90000000).toISOString(),
    readTime: '5 min',
    isFeatured: false,
    views: 1800
  },
  {
    id: '9',
    title: 'Festival des Arts de Conakry : un succès retentissant',
    excerpt: 'La culture guinéenne célébrée dans toute sa diversité.',
    content: 'La dernière édition du festival a attiré des milliers de visiteurs. Entre concerts de musique traditionnelle, expositions d\'art contemporain et représentations théâtrales, l\'événement a brillamment mis en valeur le foisonnement culturel du pays.',
    imageUrl: 'https://picsum.photos/seed/samou9/800/600',
    categoryId: 'culture',
    author: 'Culture Mag',
    date: new Date(Date.now() - 100000000).toISOString(),
    readTime: '6 min',
    isFeatured: false,
    views: 2200
  },
  {
    id: '10',
    title: 'Rentrée scolaire : les défis du nouveau programme',
    excerpt: 'Enseignants et élèves s\'adaptent aux réformes éducatives.',
    content: 'La rentrée des classes s\'est déroulée sous le signe de la nouveauté avec l\'introduction de nouveaux manuels et de méthodes pédagogiques révisées. Si les parents saluent cette volonté de modernisation, le corps enseignant réclame davantage de moyens pour une mise en œuvre efficace.',
    imageUrl: 'https://picsum.photos/seed/samou10/800/600',
    categoryId: 'education',
    author: 'Dossier Éducation',
    date: new Date(Date.now() - 120000000).toISOString(),
    readTime: '7 min',
    isFeatured: false,
    views: 3100
  },
  {
    id: '11',
    title: 'Campagne nationale de vaccination contre le paludisme',
    excerpt: 'Le ministère de la Santé déploie des équipes dans tout le pays.',
    content: 'Dans le cadre de la lutte continue contre le paludisme, une vaste campagne de vaccination gratuite a été lancée ce lundi. Les autorités sanitaires visent en priorité les enfants de moins de cinq ans et les femmes enceintes, les plus vulnérables face à la maladie.',
    imageUrl: 'https://picsum.photos/seed/samou11/800/600',
    categoryId: 'sante',
    author: 'Santé Info',
    date: new Date(Date.now() - 150000000).toISOString(),
    readTime: '4 min',
    isFeatured: false,
    views: 1950
  },
  {
    id: '12',
    title: 'Lutte contre la déforestation : un enjeu majeur',
    excerpt: 'Les associations alertent sur la perte de couvert forestier.',
    content: 'Le recul inquiétant de nos forêts appelle à une action urgente. Les ONG environnementales plaident pour un renforcement des contrôles contre la coupe illégale de bois et encouragent des pratiques agricoles plus respectueuses de l\'écosystème.',
    imageUrl: 'https://picsum.photos/seed/samou12/800/600',
    categoryId: 'environnement',
    author: 'Eco Citoyen',
    date: new Date(Date.now() - 180000000).toISOString(),
    readTime: '5 min',
    isFeatured: false,
    views: 1400
  },
  {
    id: '13',
    title: 'Sommet de l\'Union Africaine : les enjeux de la rencontre',
    excerpt: 'Les chefs d\'État se réunissent pour discuter de la sécurité et du commerce.',
    content: 'Le sommet annuel de l\'Union Africaine s\'ouvre aujourd\'hui. Au cœur des débats : la résolution des conflits régionaux, l\'intégration économique continentale et la réponse commune face aux défis climatiques.',
    imageUrl: 'https://picsum.photos/seed/samou13/800/600',
    categoryId: 'international',
    author: 'Bureau Afrique',
    date: new Date(Date.now() - 200000000).toISOString(),
    readTime: '6 min',
    isFeatured: false,
    views: 2800
  },
  {
    id: '14',
    title: 'Société : L\'impact des réseaux sociaux sur les jeunes',
    excerpt: 'Une étude révèle les nouvelles habitudes de consommation numérique.',
    content: 'Une récente enquête menée auprès des jeunes Guinéens met en lumière la place prépondérante des réseaux sociaux dans leur quotidien. Si ces plateformes favorisent le lien social et l\'accès à l\'information, elles soulèvent également des inquiétudes quant à la désinformation et au bien-être mental.',
    imageUrl: 'https://picsum.photos/seed/samou14/800/600',
    categoryId: 'societe',
    author: 'Chronique Société',
    date: new Date(Date.now() - 220000000).toISOString(),
    readTime: '5 min',
    isFeatured: true,
    views: 3600
  }
];

const expandedArticles: any[] = [];
baseArticles.forEach((article, index) => {
  expandedArticles.push(article);
  for (let i = 1; i <= 5; i++) {
    expandedArticles.push({
      ...article,
      id: `${article.id}_dup_${i}`,
      title: i % 2 === 0 ? `Analyse : ${article.title}` : `${article.title} (Suite)`,
      views: Math.floor(article.views * (0.9 - i * 0.1)),
      isFeatured: false,
      date: new Date(new Date(article.date).getTime() - (i * 86400000)).toISOString(),
      imageUrl: `https://picsum.photos/seed/samou_${article.id}_${i}/800/600`
    });
  }
});
export const articles = expandedArticles;

export const siteConfig = {
  name: "SAMOU MÉDIA",
  slogan: "Informer. Éclairer. Rassembler.",
  address: "Bonfi Niger, Matam",
  phone: "+224 625 80 87 66",
  emails: ["SAMOUMEDIA.@gmail.com", "Mohamedfof66@gmail.com"],
  socials: {
    facebook: "https://www.facebook.com/share/1DzmjJ8iAs/",
    twitter: "#",
    youtube: "#",
    tiktok: "#",
    whatsapp: "#"
  },
  socialStats: {
    facebook: "12.5K",
    twitter: "8.2K",
    youtube: "5.7K"
  }
};

export const chroniques = [
  {
    id: 'c1',
    title: 'Transition en Guinée : où en sommes-nous ?',
    author: 'Abdoulaye Diallo',
    authorAvatar: 'https://picsum.photos/seed/author1/100/100'
  },
  {
    id: 'c2',
    title: 'Parole d\'expert : L\'économie guinéenne à la croisée des chemins',
    author: 'Dr. Mohamed Camara',
    authorAvatar: 'https://picsum.photos/seed/author2/100/100'
  },
  {
    id: 'c3',
    title: 'Analyse : Comprendre les enjeux de la réforme du secteur minier',
    author: 'Alpha Kaba',
    authorAvatar: 'https://picsum.photos/seed/author3/100/100'
  }
];

export const adSpaces = [
  { id: '1', name: 'Header Ad', format: 'horizontal', location: 'home_top', isActive: true, imageUrl: 'https://picsum.photos/seed/ad_header/728/90', targetUrl: '#' },
  { id: '2', name: 'Sidebar Ad', format: 'vertical', location: 'sidebar', isActive: true, imageUrl: 'https://picsum.photos/seed/ad_sidebar/300/600', targetUrl: '#' },
  { id: '3', name: 'Article In-content', format: 'in-article', location: 'article_middle', isActive: true, imageUrl: 'https://picsum.photos/seed/ad_inarticle/728/90', targetUrl: '#' },
  { id: '4', name: 'Popup Ad', format: 'popup', location: 'popup', isActive: true, imageUrl: 'https://picsum.photos/seed/ad_popup/400/300', targetUrl: '#' }
];
