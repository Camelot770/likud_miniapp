import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initTelegram, getInitData, getUserInfo } from './lib/telegram';
import { authenticate, setToken, getToken } from './lib/api';
import type { User, AuthState } from './lib/types';
import BottomNav from './components/layout/BottomNav';
import Loader from './components/ui/Loader';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Polls from './pages/Polls';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import Youth from './pages/Youth';

interface AuthContextType extends AuthState {
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const performAuth = useCallback(async () => {
    try {
      const initData = getInitData();

      if (initData) {
        const { token, user } = await authenticate(initData);
        setState({
          token,
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Development fallback: create mock user from Telegram data or defaults
        const tgUser = getUserInfo();
        const mockUser: User = {
          id: 1,
          telegramId: tgUser?.id || 12345,
          firstName: tgUser?.first_name || 'Гость',
          lastName: tgUser?.last_name || '',
          username: tgUser?.username || 'guest',
          phone: '',
          city: 'Тель-Авив',
          joinedAt: new Date().toISOString(),
          notificationsEnabled: true,
          eventsCount: 3,
          pollsCount: 7,
        };
        setState({
          token: 'dev-token',
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Auth failed:', error);
      // Fallback for development
      const mockUser: User = {
        id: 1,
        telegramId: 12345,
        firstName: 'Гость',
        lastName: '',
        username: 'guest',
        phone: '',
        city: 'Тель-Авив',
        joinedAt: new Date().toISOString(),
        notificationsEnabled: true,
        eventsCount: 0,
        pollsCount: 0,
      };
      setState({
        token: null,
        user: mockUser,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { getMe } = await import('./lib/api');
      const user = await getMe();
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const setUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  useEffect(() => {
    initTelegram();
    performAuth();
  }, [performAuth]);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/youth" element={<Youth />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
