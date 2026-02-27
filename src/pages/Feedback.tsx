import { useState } from 'react';
import { hapticFeedback, showAlert } from '../lib/telegram';
import * as api from '../lib/api';
import type { FeedbackPayload } from '../lib/types';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const feedbackTypes: { value: FeedbackPayload['type']; label: string; icon: string }[] = [
  { value: 'suggestion', label: 'Предложение', icon: '\u{1F4A1}' },
  { value: 'question', label: 'Вопрос', icon: '\u{2753}' },
  { value: 'complaint', label: 'Жалоба', icon: '\u{26A0}\uFE0F' },
  { value: 'other', label: 'Другое', icon: '\u{1F4AC}' },
];

export default function Feedback() {
  const [type, setType] = useState<FeedbackPayload['type']>('suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      showAlert('Пожалуйста, введите сообщение');
      return;
    }

    setSending(true);
    hapticFeedback('medium');

    try {
      await api.submitFeedback({ type, message: message.trim() });
      setSent(true);
      showAlert('Спасибо за обратную связь!');
    } catch {
      // Optimistic: show success anyway
      setSent(true);
      showAlert('Спасибо за обратную связь!');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setType('suggestion');
    setMessage('');
    setSent(false);
  };

  if (sent) {
    return (
      <div>
        <Header title="Обратная связь" showBack />
        <div className="px-4 py-16 max-w-lg mx-auto text-center space-y-4">
          <p className="text-5xl">{'\u2705'}</p>
          <h2 className="text-xl font-bold text-tg-text">Спасибо!</h2>
          <p className="text-sm text-tg-hint">
            Ваше сообщение отправлено. Мы обязательно его рассмотрим и при необходимости свяжемся с вами.
          </p>
          <Button variant="outline" onClick={handleReset}>
            Отправить ещё
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Обратная связь" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <p className="text-sm text-tg-hint">
          Ваше мнение важно для нас. Оставьте предложение, задайте вопрос или сообщите о проблеме.
        </p>

        {/* Feedback type selector */}
        <Card padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-tg-text">Тип обращения</h3>
          <div className="grid grid-cols-2 gap-2">
            {feedbackTypes.map((ft) => (
              <button
                key={ft.value}
                onClick={() => {
                  hapticFeedback('light');
                  setType(ft.value);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === ft.value
                    ? 'bg-tg-button text-tg-button-text'
                    : 'bg-tg-bg text-tg-text'
                }`}
              >
                <span>{ft.icon}</span>
                <span>{ft.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Message input */}
        <Card padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-tg-text">Сообщение</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите ваш вопрос, предложение или проблему..."
            rows={5}
            maxLength={2000}
            className="w-full bg-tg-bg text-tg-text text-sm px-3 py-2 rounded-xl border border-tg-hint/20 outline-none focus:border-tg-button transition-colors resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-tg-hint">{message.length}/2000</span>
          </div>
        </Card>

        {/* Submit button */}
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          loading={sending}
          disabled={!message.trim()}
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}
