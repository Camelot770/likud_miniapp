import { useNavigate, useLocation } from 'react-router-dom';
import { hapticFeedback } from '../../lib/telegram';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    hapticFeedback('light');
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 bg-tg-bg z-40 border-b border-tg-secondary-bg">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <div className="w-16 flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="text-tg-link text-sm font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">&lsaquo;</span>
              <span>Назад</span>
            </button>
          )}
        </div>

        <h1 className="text-base font-semibold text-tg-text truncate flex-1 text-center">
          {title}
        </h1>

        <div className="w-16 flex items-center justify-end">
          {rightAction && (
            <button
              onClick={rightAction.onClick}
              className="text-tg-link text-sm font-medium"
            >
              {rightAction.label}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
