import { useEffect, useState } from 'react';
import { hapticFeedback } from '../lib/telegram';
import * as api from '../lib/api';
import Header from '../components/layout/Header';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';

interface YouthProgram {
  id: string;
  title: string;
  description: string;
  ageRange?: string;
  schedule?: string;
}

interface YouthLeader {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
}

const mockPrograms: YouthProgram[] = [
  {
    id: '1',
    title: 'Школа молодого лидера',
    description: 'Программа подготовки молодых политических лидеров. Курсы публичных выступлений, политического анализа и управления проектами.',
    ageRange: '18-30',
  },
  {
    id: '2',
    title: 'Политический клуб',
    description: 'Еженедельные дискуссии на актуальные политические и общественные темы. Открыто для всех желающих.',
    schedule: 'Каждый четверг, 19:00',
  },
  {
    id: '3',
    title: 'Волонтёрский корпус',
    description: 'Участие в волонтёрских проектах и общественных инициативах. Помощь нуждающимся и развитие общины.',
  },
];

const mockLeaders: YouthLeader[] = [
  {
    id: '1',
    name: 'Давид Коган',
    role: 'Председатель молодёжного отделения',
  },
  {
    id: '2',
    name: 'Анна Левина',
    role: 'Координатор программ',
  },
  {
    id: '3',
    name: 'Михаил Штерн',
    role: 'Руководитель волонтёрского корпуса',
  },
];

export default function Youth() {
  const [programs, setPrograms] = useState<YouthProgram[]>(mockPrograms);
  const [leaders, setLeaders] = useState<YouthLeader[]>(mockLeaders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [programsData, leadersData] = await Promise.allSettled([
        api.getYouthPrograms(),
        api.getYouthLeaders(),
      ]);

      if (programsData.status === 'fulfilled' && Array.isArray(programsData.value) && programsData.value.length > 0) {
        setPrograms(programsData.value);
      }
      if (leadersData.status === 'fulfilled' && Array.isArray(leadersData.value) && leadersData.value.length > 0) {
        setLeaders(leadersData.value);
      }
    } catch {
      // Use mock data on failure
    } finally {
      setLoading(false);
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Молодёжь" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Programs */}
        <div>
          <h3 className="text-base font-semibold text-tg-text mb-3">
            {'\u{1F393}'} Программы
          </h3>
          <div className="space-y-4">
            {programs.map((program) => (
              <Card
                key={program.id}
                padding="none"
                className="overflow-hidden"
                clickable
                onClick={() => hapticFeedback('light')}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {program.ageRange && (
                      <span className="text-xs bg-tg-button/10 text-tg-button px-2 py-0.5 rounded-full font-medium">
                        {program.ageRange} лет
                      </span>
                    )}
                    {program.schedule && (
                      <span className="text-xs bg-tg-button/10 text-tg-button px-2 py-0.5 rounded-full font-medium">
                        {program.schedule}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-tg-text mb-1">
                    {program.title}
                  </h4>
                  <p className="text-sm text-tg-hint">
                    {program.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaders */}
        <div>
          <h3 className="text-base font-semibold text-tg-text mb-3">
            {'\u{1F465}'} Лидеры
          </h3>
          <div className="space-y-3">
            {leaders.map((leader) => (
              <Card
                key={leader.id}
                padding="md"
                className="flex items-center gap-3"
                clickable
                onClick={() => hapticFeedback('light')}
              >
                {leader.photoUrl ? (
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-tg-button/10 flex items-center justify-center text-tg-button font-semibold text-lg">
                    {leader.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-tg-text">{leader.name}</h4>
                  <p className="text-xs text-tg-hint mt-0.5">{leader.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {programs.length === 0 && leaders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">{'\u{1F393}'}</p>
            <p className="text-tg-hint">Информация о молодёжных программах скоро появится</p>
          </div>
        )}
      </div>
    </div>
  );
}
