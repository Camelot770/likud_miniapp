import { useLocation, useNavigate } from 'react-router-dom';
import { hapticFeedback } from '../../lib/telegram';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  matchPaths: string[];
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Главная',
    icon: '\u{1F3E0}',
    matchPaths: ['/'],
  },
  {
    path: '/news',
    label: 'Новости',
    icon: '\u{1F4F0}',
    matchPaths: ['/news'],
  },
  {
    path: '/events',
    label: 'События',
    icon: '\u{1F4C5}',
    matchPaths: ['/events'],
  },
  {
    path: '/profile',
    label: 'Профиль',
    icon: '\u{1F464}',
    matchPaths: ['/profile', '/feedback'],
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: NavItem) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return item.matchPaths.some((p) => location.pathname.startsWith(p));
  };

  const handleNavigate = (path: string) => {
    hapticFeedback('light');
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-secondary-bg z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-colors ${
                active ? 'text-tg-button' : 'text-tg-hint'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${active ? 'text-tg-button' : 'text-tg-hint'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
