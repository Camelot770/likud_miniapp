import { useState } from 'react';
import { hapticFeedback } from '../../lib/telegram';
import Card from '../ui/Card';
import type { Poll, PollOption } from '../../lib/types';

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  loading?: boolean;
}

function ProgressBar({ percentage, isSelected }: { percentage: number; isSelected: boolean }) {
  return (
    <div className="relative h-2 bg-tg-bg rounded-full overflow-hidden mt-1">
      <div
        className={`absolute left-0 top-0 h-full rounded-full animate-progress ${
          isSelected ? 'bg-tg-button' : 'bg-tg-hint/40'
        }`}
        style={{ '--target-width': `${percentage}%`, width: `${percentage}%` } as React.CSSProperties}
      />
    </div>
  );
}

function formatTimeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Голосование завершено';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `Осталось ${days} дн.`;
  if (hours > 0) return `Осталось ${hours} ч.`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `Осталось ${minutes} мин.`;
}

export default function PollCard({ poll, onVote, loading }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasVoted = poll.votedOptionId !== null;
  const showResults = hasVoted;

  const handleVote = (option: PollOption) => {
    if (hasVoted || !poll.isActive || loading) return;
    hapticFeedback('medium');
    setSelectedOption(option.id);
    onVote?.(poll.id, option.id);
  };

  const getPercentage = (option: PollOption): number => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((option.votes / poll.totalVotes) * 100);
  };

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-tg-text leading-snug flex-1">
          {poll.question}
        </h3>
        {poll.isActive && (
          <span className="text-[10px] text-tg-hint bg-tg-bg px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">
            {formatTimeLeft(poll.endsAt)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option);
          const isVoted = poll.votedOptionId === option.id;
          const isSelecting = selectedOption === option.id;

          if (showResults) {
            return (
              <div key={option.id} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isVoted ? 'font-semibold text-tg-button' : 'text-tg-text'}`}>
                    {isVoted && '\u2713 '}{option.text}
                  </span>
                  <span className={`text-xs font-medium ${isVoted ? 'text-tg-button' : 'text-tg-hint'}`}>
                    {percentage}%
                  </span>
                </div>
                <ProgressBar percentage={percentage} isSelected={isVoted} />
              </div>
            );
          }

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option)}
              disabled={!poll.isActive || loading}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                isSelecting
                  ? 'bg-tg-button text-tg-button-text'
                  : 'bg-tg-bg text-tg-text hover:bg-tg-button/10'
              } ${!poll.isActive ? 'opacity-50' : ''}`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-tg-hint">
        {'\u{1F4CA}'} {poll.totalVotes} {poll.totalVotes === 1 ? 'голос' : poll.totalVotes < 5 ? 'голоса' : 'голосов'}
      </p>
    </Card>
  );
}
