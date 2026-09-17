import { useEffect, useState } from 'react';
import type { Ad, Article, Category, Chronique, Photo, SiteConfig } from '../types';
import { normalizeArticle } from './text';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Category[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, setCategories };
}

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: SiteConfig | null) => setConfig(data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}

export function useAds(location?: string, format?: string) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/ads?';
    if (location) url += `location=${encodeURIComponent(location)}&`;
    if (format) url += `format=${encodeURIComponent(format)}`;

    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Ad[]) => setAds(Array.isArray(data) ? data.filter(ad => ad.isActive) : []))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, [location, format]);

  return { ads, loading };
}

export function useArticles(params?: { category?: string; featured?: boolean; limit?: number; sort?: string; q?: string; status?: string; tag?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/articles?';
    if (params?.category) url += `category=${encodeURIComponent(params.category)}&`;
    if (params?.featured) url += `featured=${params.featured}&`;
    if (params?.limit) url += `limit=${params.limit}&`;
    if (params?.sort) url += `sort=${encodeURIComponent(params.sort)}&`;
    if (params?.q) url += `q=${encodeURIComponent(params.q)}&`;
    if (params?.status) url += `status=${encodeURIComponent(params.status)}&`;
    if (params?.tag) url += `tag=${encodeURIComponent(params.tag)}&`;

    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Article[]) => setArticles(Array.isArray(data) ? data.map(normalizeArticle) : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [params?.category, params?.featured, params?.limit, params?.sort, params?.q, params?.status, params?.tag]);

  return { articles, loading };
}

export function useChroniques() {
  const [chroniques, setChroniques] = useState<Chronique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chroniques', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Chronique[]) => setChroniques(Array.isArray(data) ? data.map(normalizeArticle) : []))
      .catch(() => setChroniques([]))
      .finally(() => setLoading(false));
  }, []);

  return { chroniques, loading };
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/photos', { cache: 'no-store' })
      .then(res => res.json())
      .then((data: Photo[]) => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);

  return { photos, loading };
}
