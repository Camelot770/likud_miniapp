import { useEffect, useState, useCallback } from 'react';
import { hapticFeedback } from '../lib/telegram';
import * as api from '../lib/api';
import type { Event } from '../lib/types';
import Header from '../components/layout/Header';
import Loader from '../components/ui/Loader';
import EventCard from '../components/events/EventCard';

const cities = ['Все', 'Тель-Авив', 'Иерусалим', 'Хайфа', 'Беэр-Шева', 'Нетания'];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Общее собрание русскоязычного отделения',
    description: 'Ежемесячное собрание членов партии. Обсуждение текущих вопросов.',
    date: new Date(Date.now() + 604800000).toISOString(),
    time: '19:00',
    city: 'Тель-Авив',
    address: 'ул. Кинг Джордж, 15',
    maxParticipants: 100,
    currentParticipants: 67,
    isRegistered: false,
  },
  {
    id: '2',
    title: 'Лекция: Экономическая политика Израиля',
    description: 'Открытая лекция о текущей экономической ситуации и планах правительства.',
    date: new Date(Date.now() + 1209600000).toISOString(),
    time: '18:30',
    city: 'Иерусалим',
    address: 'ул. Яффо, 42',
    imageUrl: '',
    maxParticipants: 80,
    currentParticipants: 45,
    isRegistered: true,
  },
  {
    id: '3',
    title: 'Встреча с депутатом Кнессета',
    description: 'Открытая встреча с депутатом фракции Ликуд. Вопросы и ответы.',
    date: new Date(Date.now() + 1814400000).toISOString(),
    time: '20:00',
    city: 'Хайфа',
    address: 'ул. Герцль, 88',
    maxParticipants: 120,
    currentParticipants: 112,
    isRegistered: false,
  },
  {
    id: '4',
    title: 'Волонтёрская акция',
    description: 'Совместная волонтёрская акция помощи нуждающимся семьям.',
    date: new Date(Date.now() + 2419200000).toISOString(),
    time: '10:00',
    city: 'Беэр-Шева',
    address: 'пл. Независимости, 1',
    maxParticipants: 50,
    currentParticipants: 23,
    isRegistered: false,
  },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Все');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [selectedCity]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const city = selectedCity === 'Все' ? undefined : selectedCity;
      const data = await api.getEvents(city);
      setEvents(data);
    } catch {
      // Use mock data, filter locally
      if (selectedCity === 'Все') {
        setEvents(mockEvents);
      } else {
        setEvents(mockEvents.filter((e) => e.city === selectedCity));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city: string) => {
    hapticFeedback('light');
    setSelectedCity(city);
  };

  const handleRegister = useCallback(async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const updated = await api.registerForEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? updated : e)),
      );
    } catch {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRegistered: true, currentParticipants: e.currentParticipants + 1 }
            : e,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleUnregister = useCallback(async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const updated = await api.unregisterFromEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? updated : e)),
      );
    } catch {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRegistered: false, currentParticipants: Math.max(0, e.currentParticipants - 1) }
            : e,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  return (
    <div>
      <Header title="События" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* City Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCityChange(city)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                selectedCity === city
                  ? 'bg-tg-button text-tg-button-text'
                  : 'bg-tg-secondary-bg text-tg-hint'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Events List */}
        {loading && events.length === 0 ? (
          <Loader size="lg" className="py-20" />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                loading={actionLoading === event.id}
              />
            ))}

            {events.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">{'\u{1F4C5}'}</p>
                <p className="text-tg-hint">
                  {selectedCity === 'Все'
                    ? 'Событий пока нет'
                    : `Событий в городе ${selectedCity} пока нет`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
