import { useEffect, useState } from 'react';

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  return { categories, loading, setCategories };
}

export function useConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  return { config, loading };
}

export function useAds(location?: string, format?: string) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/ads?';
    if (location) url += `location=${location}&`;
    if (format) url += `format=${format}`;
    
    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setAds(data.filter((ad: any) => ad.isActive));
        setLoading(false);
      });
  }, [location, format]);

  return { ads, loading };
}

export function useArticles(params?: { category?: string; featured?: boolean; limit?: number; sort?: string; q?: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/articles?';
    if (params?.category) url += `category=${params.category}&`;
    if (params?.featured) url += `featured=${params.featured}&`;
    if (params?.limit) url += `limit=${params.limit}&`;
    if (params?.sort) url += `sort=${params.sort}&`;
    if (params?.q) url += `q=${encodeURIComponent(params.q)}&`;

    fetch(url, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, [params?.category, params?.featured, params?.limit, params?.sort, params?.q]);

  return { articles, loading };
}

export function useChroniques() {
  const [chroniques, setChroniques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chroniques', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setChroniques(data);
        setLoading(false);
      });
  }, []);

  return { chroniques, loading };
}
