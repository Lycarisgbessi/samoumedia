export const getToken = () => localStorage.getItem('admin_token');
export const setToken = (token: string) => localStorage.setItem('admin_token', token);
export const removeToken = () => localStorage.removeItem('admin_token');

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = { 
    ...options.headers, 
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  } as any;
  
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401 || res.status === 403) {
    removeToken();
    window.location.href = '/admin/login';
    throw new Error('Non autorisé');
  }
  
  return res;
};
