import { getApiUrl } from './api';

export interface MediaItemPayload {
  tmdbId: number;
  media_type?: string;
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
}

function authHeaders(token: string, extra: Record<string,string> = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

export async function fetchFavorites(token: string) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/favorites`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Failed favorites fetch: ${res.status}`);
  const data = await res.json();
  return data.favorites || [];
}

export async function favoriteExists(token: string, tmdbId: number) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/favorites/${tmdbId}`, { headers: authHeaders(token) });
  if (!res.ok) return false;
  const json = await res.json();
  return !!json.exists;
}

export async function addFavorite(token: string, payload: MediaItemPayload) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/favorites`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Add favorite failed: ${res.status} - ${errorData.message || 'Unknown'}`);
  }
  const data = await res.json();
  return data.favorites || [];
}

export async function removeFavorite(token: string, tmdbId: number) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/favorites/${tmdbId}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Remove favorite failed: ${res.status}`);
  return (await res.json()).favorites || [];
}

export async function fetchWatchlist(token: string) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watchlist`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed watchlist fetch');
  return (await res.json()).watchlist || [];
}

export async function addWatchlist(token: string, payload: MediaItemPayload) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watchlist`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Add watchlist failed: ${res.status} - ${errorData.message || 'Unknown'}`);
  }
  const data = await res.json();
  return data.watchlist || [];
}

export async function removeWatchlist(token: string, tmdbId: number) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watchlist/${tmdbId}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Remove watchlist failed: ${res.status}`);
  return (await res.json()).watchlist || [];
}

export async function fetchWatchHistory(token: string) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watch-history`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed watch-history fetch');
  return (await res.json()).watchHistory || [];
}

export async function addWatchHistory(token: string, payload: MediaItemPayload) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watch-history`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Add watch-history failed: ${res.status}`);
  return (await res.json()).watchHistory || [];
}

export async function removeWatchHistory(token: string, tmdbId: number) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/watch-history/${tmdbId}`, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Remove watch-history failed: ${res.status}`);
  return (await res.json()).watchHistory || [];
}

// UPDATE OPERATIONS

export interface UpdateProfilePayload {
  name: string;
}

export interface UpdateFavoritePayload {
  personalRating?: number;
  notes?: string;
}

// Update user profile (name)
export async function updateProfile(token: string, payload: UpdateProfilePayload) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/profile`, {
    method: 'PUT',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Update profile failed: ${res.status} - ${errorData.message || 'Unknown'}`);
  }
  const data = await res.json();
  return data.user;
}

// Update favorite item (rating/notes)
export async function updateFavorite(token: string, tmdbId: number, payload: UpdateFavoritePayload) {
  const api = getApiUrl();
  const res = await fetch(`${api}/api/user/favorites/${tmdbId}`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Update favorite failed: ${res.status} - ${errorData.message || 'Unknown'}`);
  }
  const data = await res.json();
  return data.favorites || [];
}
