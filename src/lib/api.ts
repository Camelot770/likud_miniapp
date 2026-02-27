import type { User, NewsItem, Event, Poll, FeedbackPayload } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://likud-rus-camelot770.amvera.io/api/v1';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export async function authenticate(initData: string): Promise<{ token: string; user: User }> {
  const result = await request<{ token: string; user: User }>('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData }),
  });
  authToken = result.token;
  return result;
}

// User
export async function getMe(): Promise<User> {
  return request<User>('/me');
}

export async function updateProfile(data: Partial<Pick<User, 'phone' | 'city' | 'notificationsEnabled'>>): Promise<User> {
  return request<User>('/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// News
export async function getNews(limit?: number): Promise<NewsItem[]> {
  const query = limit ? `?limit=${limit}` : '';
  return request<NewsItem[]>(`/news${query}`);
}

export async function getNewsById(id: string): Promise<NewsItem> {
  return request<NewsItem>(`/news/${id}`);
}

// Events
export async function getEvents(city?: string): Promise<Event[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<Event[]>(`/events${query}`);
}

export async function getEventById(id: string): Promise<Event> {
  return request<Event>(`/events/${id}`);
}

export async function registerForEvent(eventId: string): Promise<Event> {
  return request<Event>(`/events/${eventId}/register`, {
    method: 'POST',
  });
}

export async function unregisterFromEvent(eventId: string): Promise<Event> {
  return request<Event>(`/events/${eventId}/unregister`, {
    method: 'POST',
  });
}

// Polls
export async function getPolls(): Promise<Poll[]> {
  return request<Poll[]>('/polls');
}

export async function getPollById(id: string): Promise<Poll> {
  return request<Poll>(`/polls/${id}`);
}

export async function vote(pollId: string, optionId: string): Promise<Poll> {
  return request<Poll>(`/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
}

// Feedback
export async function submitFeedback(payload: FeedbackPayload): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Youth
export async function getYouthPrograms(): Promise<any[]> {
  const res = await request<any>('/public/youth/programs');
  return res.data || res;
}

export async function getYouthLeaders(): Promise<any[]> {
  const res = await request<any>('/public/youth/leaders');
  return res.data || res;
}
