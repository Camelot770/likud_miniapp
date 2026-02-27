export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  city?: string;
  joinedAt: string;
  notificationsEnabled: boolean;
  eventsCount: number;
  pollsCount: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  category: string;
  author: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  address: string;
  imageUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  isRegistered: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  votedOptionId: string | null;
  isActive: boolean;
  endsAt: string;
}

export interface FeedbackPayload {
  type: 'suggestion' | 'complaint' | 'question' | 'other';
  message: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
