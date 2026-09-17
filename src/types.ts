export interface Category {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface Chronique {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorRole: string;
  authorImage: string;
  date: string;
  excerpt: string;
  content: string;
  authorId?: string;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
  isDeleted: boolean;
  views: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  categoryId: string;
  author: string;
  authorId?: string;
  date: string;
  readTime?: string;
  isFeatured: boolean;
  views: number;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
  isDeleted: boolean;
}

export interface SiteConfig {
  id?: number;
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

export interface Ad {
  id: string;
  name: string;
  format: string;
  location: string;
  isActive: boolean;
  imageUrl?: string | null;
  targetUrl?: string | null;
}
