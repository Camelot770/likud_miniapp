import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hapticFeedback } from '../lib/telegram';
import * as api from '../lib/api';
import type { Event } from '../lib/types';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';

const mockEventDetail: Record<string, Event> = {
  '1': {
    id: '1',
    title: 'Общее собрание русскоязычного отделения',
    description:
      'Ежемесячное собрание членов партии Ликуд. На повестке дня:\n\n1. Отчёт о деятельности за прошедший месяц\n2. Обсуждение предстоящих выборов в местные органы власти\n3. Планирование волонтёрских акций\n4. Вопросы и предложения участников\n\nПриглашаем всех членов партии и сочувствующих. Будут предоставлены лёгкие закуски и напитки.',
    date: new Date(Date.now() + 604800000).toISOString(),
    time: '19:00',
    city: 'Тель-Авив',
    address: 'ул. Кинг Джордж, 15, 3-й этаж, зал А',
    maxParticipants: 100,
    currentParticipants: 67,
    isRegistered: false,
  },
  '2': {
    id: '2',
    title: 'Лекция: Экономическая политика Израиля',
    description:
      'Открытая лекция о текущей экономической ситуации и планах правительства.\n\nЛектор: проф. Давид Коган, экономический советник фракции Ликуд.\n\nТемы лекции:\n- Текущее состояние экономики\n- Инфляция и меры борьбы\n- Перспективы развития хай-тек сектора\n- Социальная политика и бюджет\n\nВход свободный. Требуется предварительная регистрация.',
    date: new Date(Date.now() + 1209600000).toISOString(),
    time: '18:30',
    city: 'Иерусалим',
    address: 'ул. Яффо, 42, конференц-зал',
    maxParticipants: 80,
    currentParticipants: 45,
    isRegistered: true,
  },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getEventById(id);
      setEvent(data);
    } catch {
      setEvent(mockEventDetail[id] || mockEventDetail['1']);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    setActionLoading(true);
    hapticFeedback('medium');
    try {
      const updated = await api.registerForEvent(event.id);
      setEvent(updated);
    } catch {
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              isRegistered: true,
              currentParticipants: prev.currentParticipants + 1,
            }
          : prev,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    setActionLoading(true);
    hapticFeedback('medium');
    try {
      const updated = await api.unregisterFromEvent(event.id);
      setEvent(updated);
    } catch {
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              isRegistered: false,
              currentParticipants: Math.max(0, prev.currentParticipants - 1),
            }
          : prev,
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Событие" showBack />
        <Loader size="lg" className="py-20" />
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Header title="Событие" showBack />
        <div className="px-4 py-20 text-center">
          <p className="text-tg-hint">Событие не найдено</p>
        </div>
      </div>
    );
  }

  const isFull = event.currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - event.currentParticipants;

  return (
    <div>
      <Header title="Событие" showBack />

      <div className="max-w-lg mx-auto">
        {event.imageUrl && (
          <div className="h-48 bg-tg-secondary-bg overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-tg-button/10 text-tg-button px-2 py-0.5 rounded-full font-medium">
              {event.city}
            </span>
            {event.isRegistered && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {'\u2713'} Вы записаны
              </span>
            )}
            {isFull && !event.isRegistered && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                Мест нет
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-tg-text">{event.title}</h1>

          {/* Info cards */}
          <div className="space-y-2">
            <Card padding="sm" className="flex items-center gap-3">
              <span className="text-xl">{'\u{1F4C5}'}</span>
              <div>
                <p className="text-sm font-medium text-tg-text">
                  {new Date(event.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="text-xs text-tg-hint">{event.time}</p>
              </div>
            </Card>

            <Card padding="sm" className="flex items-center gap-3">
              <span className="text-xl">{'\u{1F4CD}'}</span>
              <div>
                <p className="text-sm font-medium text-tg-text">{event.address}</p>
                <p className="text-xs text-tg-hint">{event.city}</p>
              </div>
            </Card>

            <Card padding="sm" className="flex items-center gap-3">
              <span className="text-xl">{'\u{1F465}'}</span>
              <div>
                <p className="text-sm font-medium text-tg-text">
                  {event.currentParticipants} из {event.maxParticipants} участников
                </p>
                {!isFull && (
                  <p className="text-xs text-tg-hint">
                    Осталось {spotsLeft} {spotsLeft === 1 ? 'место' : spotsLeft < 5 ? 'места' : 'мест'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Progress bar for registration */}
          <div>
            <div className="flex justify-between text-xs text-tg-hint mb-1">
              <span>Регистрация</span>
              <span>{Math.round((event.currentParticipants / event.maxParticipants) * 100)}%</span>
            </div>
            <div className="h-2 bg-tg-secondary-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-tg-button rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-tg-text mb-2">Описание</h3>
            <p className="text-sm text-tg-text leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* QR Code placeholder for registered users */}
          {event.isRegistered && (
            <Card padding="md" className="text-center space-y-2">
              <p className="text-sm font-semibold text-tg-text">Ваш билет</p>
              <div className="w-32 h-32 mx-auto bg-tg-bg rounded-xl flex items-center justify-center border-2 border-dashed border-tg-hint/30">
                <div className="text-center">
                  <p className="text-3xl mb-1">{'\u{1F3AB}'}</p>
                  <p className="text-[10px] text-tg-hint">QR-код билета</p>
                </div>
              </div>
              <p className="text-xs text-tg-hint">Покажите этот код на входе</p>
            </Card>
          )}

          {/* Action button */}
          <div className="pt-2">
            {event.isRegistered ? (
              <Button
                variant="danger"
                fullWidth
                onClick={handleUnregister}
                loading={actionLoading}
              >
                Отменить запись
              </Button>
            ) : (
              <Button
                fullWidth
                onClick={handleRegister}
                disabled={isFull}
                loading={actionLoading}
              >
                {isFull ? 'Мест нет' : 'Записаться'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
