import { useEffect, useState } from 'react';
import * as api from '../lib/api';
import type { NewsItem } from '../lib/types';
import Header from '../components/layout/Header';
import Loader from '../components/ui/Loader';
import NewsCard from '../components/news/NewsCard';

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Заседание партии по вопросам безопасности',
    summary: 'Обсуждение актуальных вопросов национальной безопасности на заседании фракции Ликуд в Кнессете.',
    content: '',
    imageUrl: '',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Политика',
    author: 'Пресс-служба',
  },
  {
    id: '2',
    title: 'Новый законопроект об образовании',
    summary: 'Фракция Ликуд представила законопроект о реформе системы образования для русскоязычных школ.',
    content: '',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'Образование',
    author: 'Пресс-служба',
  },
  {
    id: '3',
    title: 'Встреча с русскоязычной общиной в Хайфе',
    summary: 'Депутаты Кнессета провели встречу с представителями русскоязычной общины в Хайфе.',
    content: '',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    category: 'Община',
    author: 'Пресс-служба',
  },
  {
    id: '4',
    title: 'Программа поддержки новых репатриантов',
    summary: 'Утверждена новая программа помощи в интеграции для репатриантов из стран бывшего СССР.',
    content: '',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    category: 'Алия',
    author: 'Пресс-служба',
  },
  {
    id: '5',
    title: 'Экономический форум русскоязычных предпринимателей',
    summary: 'В Тель-Авиве прошёл ежегодный форум русскоязычных предпринимателей при поддержке партии.',
    content: '',
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    category: 'Экономика',
    author: 'Пресс-служба',
  },
];

export default function News() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await api.getNews();
      setNews(data);
    } catch {
      // Use mock data
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Новости" />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {loading && news.length === 0 ? (
          <Loader size="lg" className="py-20" />
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}

            {news.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">{'\u{1F4F0}'}</p>
                <p className="text-tg-hint">Новости пока нет</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
