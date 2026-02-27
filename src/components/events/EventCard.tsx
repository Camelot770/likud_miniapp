import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '../../lib/telegram';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Event } from '../../lib/types';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  loading?: boolean;
}

function formatEventDate(dateStr: string, timeStr: string): string {
  const date = new Date(dateStr);
  const dayMonth = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  return `${dayMonth} (${weekday}), ${timeStr}`;
}

export default function EventCard({ event, onRegister, onUnregister, loading }: EventCardProps) {
  const navigate = useNavigate();
  const isFull = event.currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - event.currentParticipants;

  const handleCardClick = () => {
    hapticFeedback('light');
    navigate(`/events/${event.id}`);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback('medium');
    if (event.isRegistered && onUnregister) {
      onUnregister(event.id);
    } else if (!event.isRegistered && onRegister) {
      onRegister(event.id);
    }
  };

  return (
    <Card clickable onClick={handleCardClick} padding="none" className="overflow-hidden">
      {event.imageUrl && (
        <div className="h-36 bg-tg-hint/20 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-tg-button/10 text-tg-button px-2 py-0.5 rounded-full font-medium">
            {event.city}
          </span>
          {event.isRegistered && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {'\u2713'} Вы записаны
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-tg-text mb-1">{event.title}</h3>

        <div className="space-y-1 mb-3">
          <p className="text-sm text-tg-hint flex items-center gap-1.5">
            <span>{'\u{1F4C5}'}</span>
            <span>{formatEventDate(event.date, event.time)}</span>
          </p>
          <p className="text-sm text-tg-hint flex items-center gap-1.5">
            <span>{'\u{1F4CD}'}</span>
            <span>{event.address}</span>
          </p>
          <p className="text-sm text-tg-hint flex items-center gap-1.5">
            <span>{'\u{1F465}'}</span>
            <span>
              {event.currentParticipants}/{event.maxParticipants} участников
              {!isFull && spotsLeft <= 10 && (
                <span className="text-orange-500 ml-1">(осталось {spotsLeft} мест)</span>
              )}
            </span>
          </p>
        </div>

        <Button
          variant={event.isRegistered ? 'secondary' : 'primary'}
          size="sm"
          fullWidth
          onClick={handleAction}
          disabled={isFull && !event.isRegistered}
          loading={loading}
        >
          {event.isRegistered
            ? 'Отменить запись'
            : isFull
            ? 'Мест нет'
            : 'Записаться'}
        </Button>
      </div>
    </Card>
  );
}
