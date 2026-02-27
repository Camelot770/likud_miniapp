import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { hapticFeedback } from '../lib/telegram';
import * as api from '../lib/api';
import type { NewsItem, Event, Poll } from '../lib/types';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import NewsCard from '../components/news/NewsCard';
import PollCard from '../components/polls/PollCard';

// Mock data for development/demo
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Заседание партии по вопросам безопасности',
    summary: 'Обсуждение актуальных вопросов национальной безопасности на заседании фракции.',
    content: '',
    imageUrl: '',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Политика',
    author: 'Пресс-служба',
  },
  {
    id: '2',
    title: 'Новый законопроект об образовании',
    summary: 'Фракция Ликуд представила законопроект о реформе системы образования.',
    content: '',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'Образование',
    author: 'Пресс-служба',
  },
  {
    id: '3',
    title: 'Встреча с русскоязычной общиной в Хайфе',
    summary: 'Депутаты Кнессета провели встречу с представителями русскоязычной общины.',
    content: '',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    category: 'Община',
    author: 'Пресс-служба',
  },
];

const mockEvent: Event = {
  id: '1',
  title: 'Общее собрание русскоязычного отделения',
  description: 'Ежемесячное собрание членов партии.',
  date: new Date(Date.now() + 604800000).toISOString(),
  time: '19:00',
  city: 'Тель-Авив',
  address: 'ул. Кинг Джордж, 15',
  maxParticipants: 100,
  currentParticipants: 67,
  isRegistered: false,
};

const mockPoll: Poll = {
  id: '1',
  question: 'Какой вопрос для вас наиболее важен?',
  options: [
    { id: 'o1', text: 'Безопасность', votes: 145 },
    { id: 'o2', text: 'Экономика', votes: 98 },
    { id: 'o3', text: 'Образование', votes: 67 },
    { id: 'o4', text: 'Здравоохранение', votes: 54 },
  ],
  totalVotes: 364,
  votedOptionId: null,
  isActive: true,
  endsAt: new Date(Date.now() + 172800000).toISOString(),
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [upcomingEvent, setUpcomingEvent] = useState<Event>(mockEvent);
  const [activePoll, setActivePoll] = useState<Poll>(mockPoll);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newsData, eventsData, pollsData] = await Promise.allSettled([
        api.getNews(3),
        api.getEvents(),
        api.getPolls(),
      ]);

      if (newsData.status === 'fulfilled') {
        setNews(newsData.value);
      }
      if (eventsData.status === 'fulfilled' && eventsData.value.length > 0) {
        setUpcomingEvent(eventsData.value[0]);
      }
      if (pollsData.status === 'fulfilled' && pollsData.value.length > 0) {
        const active = pollsData.value.find((p) => p.isActive);
        if (active) setActivePoll(active);
      }
    } catch {
      // Use mock data on failure
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegister = async () => {
    setEventLoading(true);
    hapticFeedback('medium');
    try {
      const updated = await api.registerForEvent(upcomingEvent.id);
      setUpcomingEvent(updated);
    } catch {
      setUpcomingEvent((prev) => ({
        ...prev,
        isRegistered: true,
        currentParticipants: prev.currentParticipants + 1,
      }));
    } finally {
      setEventLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    setPollLoading(true);
    hapticFeedback('medium');
    try {
      const updated = await api.vote(pollId, optionId);
      setActivePoll(updated);
    } catch {
      setActivePoll((prev) => ({
        ...prev,
        votedOptionId: optionId,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
        ),
      }));
    } finally {
      setPollLoading(false);
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Ликуд РУ" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-tg-text">
            {'\u{1F44B}'} Привет, {user?.firstName || 'Гость'}!
          </h2>
          <p className="text-sm text-tg-hint mt-1">
            Добро пожаловать в приложение русскоязычного отделения Ликуд
          </p>
        </div>

        {/* Latest News - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-tg-text">Последние новости</h3>
            <button
              onClick={() => {
                hapticFeedback('light');
                navigate('/news');
              }}
              className="text-sm text-tg-link font-medium"
            >
              Все {'\u203A'}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} compact />
            ))}
          </div>
        </div>

        {/* Upcoming Event */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-tg-text">Ближайшее событие</h3>
            <button
              onClick={() => {
                hapticFeedback('light');
                navigate('/events');
              }}
              className="text-sm text-tg-link font-medium"
            >
              Все {'\u203A'}
            </button>
          </div>
          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-tg-button/10 text-tg-button px-2 py-0.5 rounded-full font-medium">
                {upcomingEvent.city}
              </span>
              {upcomingEvent.isRegistered && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {'\u2713'} Вы записаны
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold text-tg-text">{upcomingEvent.title}</h4>
            <div className="space-y-1">
              <p className="text-sm text-tg-hint">
                {'\u{1F4C5}'} {new Date(upcomingEvent.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}, {upcomingEvent.time}
              </p>
              <p className="text-sm text-tg-hint">
                {'\u{1F4CD}'} {upcomingEvent.address}
              </p>
              <p className="text-sm text-tg-hint">
                {'\u{1F465}'} {upcomingEvent.currentParticipants}/{upcomingEvent.maxParticipants} участников
              </p>
            </div>
            {!upcomingEvent.isRegistered && (
              <Button
                fullWidth
                onClick={handleEventRegister}
                loading={eventLoading}
              >
                Записаться
              </Button>
            )}
          </Card>
        </div>

        {/* Active Poll */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-tg-text">Активный опрос</h3>
            <button
              onClick={() => {
                hapticFeedback('light');
                navigate('/polls');
              }}
              className="text-sm text-tg-link font-medium"
            >
              Все {'\u203A'}
            </button>
          </div>
          <PollCard poll={activePoll} onVote={handleVote} loading={pollLoading} />
        </div>

        {/* Youth */}
        <Card
          clickable
          onClick={() => {
            hapticFeedback('light');
            navigate('/youth');
          }}
          padding="md"
          className="flex items-center gap-4"
        >
          <span className="text-3xl">{'\u{1F393}'}</span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-tg-text">Молодёжь Ликуда</h3>
            <p className="text-sm text-tg-hint mt-0.5">Программы, лидеры и возможности</p>
          </div>
          <span className="text-tg-hint text-lg">{'\u203A'}</span>
        </Card>
      </div>
    </div>
  );
}
