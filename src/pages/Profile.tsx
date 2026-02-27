import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { hapticFeedback, showAlert } from '../lib/telegram';
import * as api from '../lib/api';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [notifications, setNotifications] = useState(user?.notificationsEnabled ?? true);

  const handleSave = async () => {
    setSaving(true);
    hapticFeedback('medium');
    try {
      const updated = await api.updateProfile({
        phone,
        city,
        notificationsEnabled: notifications,
      });
      setUser(updated);
      setIsEditing(false);
      showAlert('Профиль обновлён');
    } catch {
      // Optimistic update
      if (user) {
        setUser({
          ...user,
          phone,
          city,
          notificationsEnabled: notifications,
        });
      }
      setIsEditing(false);
      showAlert('Профиль обновлён');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhone(user?.phone || '');
    setCity(user?.city || '');
    setNotifications(user?.notificationsEnabled ?? true);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div>
      <Header
        title="Профиль"
        rightAction={
          isEditing
            ? undefined
            : { label: 'Изменить', onClick: () => setIsEditing(true) }
        }
      />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* User avatar and name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-tg-button flex items-center justify-center flex-shrink-0">
            <span className="text-2xl text-tg-button-text font-bold">
              {user.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-tg-text">
              {user.firstName} {user.lastName}
            </h2>
            {user.username && (
              <p className="text-sm text-tg-hint">@{user.username}</p>
            )}
            <p className="text-xs text-tg-hint mt-0.5">
              Участник с {new Date(user.joinedAt).toLocaleDateString('ru-RU', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-tg-button">{user.eventsCount}</p>
            <p className="text-xs text-tg-hint mt-1">Мероприятий</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-tg-button">{user.pollsCount}</p>
            <p className="text-xs text-tg-hint mt-1">Опросов</p>
          </Card>
        </div>

        {/* Profile form */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold text-tg-text">Контактные данные</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-tg-hint block mb-1">Телефон</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+972-XX-XXX-XXXX"
                  className="w-full bg-tg-bg text-tg-text text-sm px-3 py-2 rounded-xl border border-tg-hint/20 outline-none focus:border-tg-button transition-colors"
                />
              ) : (
                <p className="text-sm text-tg-text">{phone || 'Не указан'}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-tg-hint block mb-1">Город</label>
              {isEditing ? (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-tg-bg text-tg-text text-sm px-3 py-2 rounded-xl border border-tg-hint/20 outline-none focus:border-tg-button transition-colors appearance-none"
                >
                  <option value="">Выберите город</option>
                  <option value="Тель-Авив">Тель-Авив</option>
                  <option value="Иерусалим">Иерусалим</option>
                  <option value="Хайфа">Хайфа</option>
                  <option value="Беэр-Шева">Беэр-Шева</option>
                  <option value="Нетания">Нетания</option>
                  <option value="Ашдод">Ашдод</option>
                  <option value="Ришон-ле-Цион">Ришон-ле-Цион</option>
                  <option value="Петах-Тиква">Петах-Тиква</option>
                  <option value="Другой">Другой</option>
                </select>
              ) : (
                <p className="text-sm text-tg-text">{city || 'Не указан'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={handleCancel} className="flex-1">
                Отмена
              </Button>
              <Button size="sm" onClick={handleSave} loading={saving} className="flex-1">
                Сохранить
              </Button>
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-tg-text">Уведомления</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tg-text">Push-уведомления</p>
              <p className="text-xs text-tg-hint">Новости, события и опросы</p>
            </div>
            <button
              onClick={() => {
                hapticFeedback('light');
                const newValue = !notifications;
                setNotifications(newValue);
                if (!isEditing) {
                  api.updateProfile({ notificationsEnabled: newValue }).catch(() => {});
                  if (user) {
                    setUser({ ...user, notificationsEnabled: newValue });
                  }
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notifications ? 'bg-tg-button' : 'bg-tg-hint/30'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Quick actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              hapticFeedback('light');
              navigate('/feedback');
            }}
          >
            {'\u{270D}\uFE0F'} Обратная связь
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              hapticFeedback('light');
              navigate('/polls');
            }}
          >
            {'\u{1F4CA}'} Мои опросы
          </Button>
        </div>
      </div>
    </div>
  );
}
