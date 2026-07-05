export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  author: string;
  date: string;
  readTime: string;
  isFeatured: boolean;
  views: number;
}

export interface SiteConfig {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  emails: string[];
  socials: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}
