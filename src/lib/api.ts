/**
 * Thin fetch wrapper — all Supabase calls go through the Express server.
 * Uses relative URLs so it works regardless of the host/port.
 */

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
  });
  if (!res.ok) {
    let message = res.statusText;
    try { const body = await res.json(); message = body.error || message; } catch {}
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(path, {
    method: 'POST',
    body: formData,
    headers: { ...authHeaders },
  });
  if (!res.ok) {
    let message = res.statusText;
    try { const body = await res.json(); message = body.error || message; } catch {}
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  recipes: {
    getPopular: (page: number, pageSize: number) =>
      request<any[]>(`/api/recipes?popular=true&page=${page}&pageSize=${pageSize}`),

    search: (q: string, mealType: string, page: number, pageSize: number) =>
      request<any[]>(`/api/recipes?q=${encodeURIComponent(q)}&mealType=${encodeURIComponent(mealType)}&page=${page}&pageSize=${pageSize}`),

    getById: (id: string) =>
      request<{ recipe: any; ingredients: any[]; instructions: any[] }>(`/api/recipes/${id}`),

    create: (body: object) =>
      request<{ id: string }>('/api/recipes', { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: object) =>
      request<{ id: string }>(`/api/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    patch: (id: string, data: object) =>
      request<{ id: string }>(`/api/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/recipes/${id}`, { method: 'DELETE' }),
  },

  comments: {
    getByRecipe: (recipeId: string) =>
      request<any[]>(`/api/comments?recipeId=${encodeURIComponent(recipeId)}`),

    add: (body: object) =>
      request<{ success: boolean }>('/api/comments', { method: 'POST', body: JSON.stringify(body) }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/comments/${id}`, { method: 'DELETE' }),
  },

  images: {
    upload: (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      return upload<{ urls: string[] }>('/api/images/upload', fd);
    },

    delete: (urls: string[]) =>
      request<{ deleted: number }>('/api/images/delete', {
        method: 'POST', body: JSON.stringify({ urls }),
      }),
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; access_token: string }>(
        '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),

    getUser: (token?: string) =>
      request<{ user: { id: string; email: string } | null }>(
        '/api/auth/user',
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ),
  },
};

export { ApiError };
