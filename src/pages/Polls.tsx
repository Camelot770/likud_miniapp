import { useEffect, useState } from 'react';
import { hapticFeedback } from '../lib/telegram';
import * as api from '../lib/api';
import type { Poll } from '../lib/types';
import Header from '../components/layout/Header';
import Loader from '../components/ui/Loader';
import PollCard from '../components/polls/PollCard';

const mockPolls: Poll[] = [
  {
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
  },
  {
    id: '2',
    question: 'Как вы оцениваете работу фракции за последний месяц?',
    options: [
      { id: 'o5', text: 'Отлично', votes: 89 },
      { id: 'o6', text: 'Хорошо', votes: 156 },
      { id: 'o7', text: 'Удовлетворительно', votes: 43 },
      { id: 'o8', text: 'Плохо', votes: 12 },
    ],
    totalVotes: 300,
    votedOptionId: null,
    isActive: true,
    endsAt: new Date(Date.now() + 432000000).toISOString(),
  },
  {
    id: '3',
    question: 'Какой формат мероприятий вы предпочитаете?',
    options: [
      { id: 'o9', text: 'Лекции и семинары', votes: 78 },
      { id: 'o10', text: 'Встречи с депутатами', votes: 124 },
      { id: 'o11', text: 'Волонтёрские акции', votes: 56 },
      { id: 'o12', text: 'Культурные мероприятия', votes: 92 },
    ],
    totalVotes: 350,
    votedOptionId: 'o10',
    isActive: false,
    endsAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>(mockPolls);
  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const data = await api.getPolls();
      setPolls(data);
    } catch {
      // Use mock data
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    setVoteLoading(pollId);
    hapticFeedback('medium');
    try {
      const updated = await api.vote(pollId, optionId);
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
    } catch {
      // Optimistic update
      setPolls((prev) =>
        prev.map((p) =>
          p.id === pollId
            ? {
                ...p,
                votedOptionId: optionId,
                totalVotes: p.totalVotes + 1,
                options: p.options.map((o) =>
                  o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
                ),
              }
            : p,
        ),
      );
    } finally {
      setVoteLoading(null);
    }
  };

  const filteredPolls = polls.filter((p) =>
    filter === 'active' ? p.isActive : !p.isActive,
  );

  return (
    <div>
      <Header title="Опросы" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              hapticFeedback('light');
              setFilter('active');
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-tg-button text-tg-button-text'
                : 'bg-tg-secondary-bg text-tg-hint'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => {
              hapticFeedback('light');
              setFilter('completed');
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-tg-button text-tg-button-text'
                : 'bg-tg-secondary-bg text-tg-hint'
            }`}
          >
            Завершённые
          </button>
        </div>

        {/* Polls list */}
        {loading && polls.length === 0 ? (
          <Loader size="lg" className="py-20" />
        ) : (
          <div className="space-y-4">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                loading={voteLoading === poll.id}
              />
            ))}

            {filteredPolls.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">{'\u{1F4CA}'}</p>
                <p className="text-tg-hint">
                  {filter === 'active'
                    ? 'Активных опросов пока нет'
                    : 'Завершённых опросов пока нет'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
