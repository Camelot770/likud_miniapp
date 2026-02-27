import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WebApp } from '../lib/telegram';
import * as api from '../lib/api';
import type { NewsItem } from '../lib/types';
import Header from '../components/layout/Header';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const mockNewsDetail: Record<string, NewsItem> = {
  '1': {
    id: '1',
    title: 'Заседание партии по вопросам безопасности',
    summary: 'Обсуждение актуальных вопросов национальной безопасности на заседании фракции.',
    content: `Вчера в Кнессете состоялось расширенное заседание фракции Ликуд, посвящённое вопросам национальной безопасности.\n\nНа заседании были обсуждены ключевые вызовы в сфере обороны, включая укрепление границ и развитие системы ПВО. Депутаты фракции представили предложения по обновлению стратегии национальной безопасности.\n\nОсобое внимание было уделено вопросам кибербезопасности и защите критической инфраструктуры. Участники заседания подчеркнули важность международного сотрудничества в этой области.\n\nПо итогам заседания был подготовлен пакет законодательных инициатив, которые будут представлены на ближайшем пленарном заседании Кнессета.`,
    imageUrl: '',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Политика',
    author: 'Пресс-служба Ликуд',
  },
  '2': {
    id: '2',
    title: 'Новый законопроект об образовании',
    summary: 'Фракция Ликуд представила законопроект о реформе системы образования.',
    content: `Фракция Ликуд представила на рассмотрение Кнессета новый законопроект, направленный на улучшение качества образования.\n\nОсновные положения законопроекта включают:\n- Увеличение финансирования школ в периферийных районах\n- Создание дополнительных программ на русском языке\n- Поддержка учителей-репатриантов\n- Развитие STEM-образования\n\nЗаконопроект получил широкую поддержку среди русскоязычных депутатов и представителей образовательного сообщества.`,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'Образование',
    author: 'Пресс-служба Ликуд',
  },
};

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getNewsById(id);
      setArticle(data);
    } catch {
      // Use mock data
      setArticle(mockNewsDetail[id] || mockNewsDetail['1']);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!article) return;
    try {
      WebApp.switchInlineQuery(article.title, ['users', 'groups', 'channels']);
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(article.title).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Новость" showBack />
        <Loader size="lg" className="py-20" />
      </div>
    );
  }

  if (!article) {
    return (
      <div>
        <Header title="Новость" showBack />
        <div className="px-4 py-20 text-center">
          <p className="text-tg-hint">Статья не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Новость"
        showBack
        rightAction={{ label: 'Поделиться', onClick: handleShare }}
      />

      <div className="max-w-lg mx-auto">
        {article.imageUrl && (
          <div className="h-48 bg-tg-secondary-bg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-tg-button bg-tg-button/10 px-2 py-0.5 rounded-full font-medium">
              {article.category}
            </span>
            <span className="text-xs text-tg-hint">
              {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-xl font-bold text-tg-text leading-snug">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-sm text-tg-hint font-medium leading-relaxed">
              {article.summary}
            </p>
          )}

          <div className="text-sm text-tg-text leading-relaxed whitespace-pre-line">
            {article.content}
          </div>

          <div className="pt-2 border-t border-tg-secondary-bg">
            <p className="text-xs text-tg-hint">{article.author}</p>
          </div>

          <Button variant="outline" fullWidth onClick={handleShare}>
            {'\u{1F4E4}'} Поделиться
          </Button>
        </div>
      </div>
    </div>
  );
}
