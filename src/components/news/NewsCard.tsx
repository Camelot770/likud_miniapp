import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '../../lib/telegram';
import Card from '../ui/Card';
import type { NewsItem } from '../../lib/types';

interface NewsCardProps {
  news: NewsItem;
  compact?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export default function NewsCard({ news, compact = false }: NewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    hapticFeedback('light');
    navigate(`/news/${news.id}`);
  };

  if (compact) {
    return (
      <Card
        clickable
        onClick={handleClick}
        padding="none"
        className="min-w-[200px] max-w-[200px] overflow-hidden flex-shrink-0"
      >
        {news.imageUrl && (
          <div className="h-24 bg-tg-hint/20 overflow-hidden">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {!news.imageUrl && (
          <div className="h-24 bg-tg-button/10 flex items-center justify-center">
            <span className="text-3xl opacity-40">{'\u{1F4F0}'}</span>
          </div>
        )}
        <div className="p-3">
          <p className="text-xs text-tg-hint mb-1">{formatDate(news.publishedAt)}</p>
          <h3 className="text-sm font-semibold text-tg-text line-clamp-2 leading-snug">
            {news.title}
          </h3>
        </div>
      </Card>
    );
  }

  return (
    <Card clickable onClick={handleClick} padding="none" className="overflow-hidden">
      {news.imageUrl && (
        <div className="h-40 bg-tg-hint/20 overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-tg-button bg-tg-button/10 px-2 py-0.5 rounded-full font-medium">
            {news.category}
          </span>
          <span className="text-xs text-tg-hint">{formatDate(news.publishedAt)}</span>
        </div>
        <h3 className="text-base font-semibold text-tg-text mb-1 leading-snug">
          {news.title}
        </h3>
        <p className="text-sm text-tg-hint line-clamp-2">{news.summary}</p>
      </div>
    </Card>
  );
}
