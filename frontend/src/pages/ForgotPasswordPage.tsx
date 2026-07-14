import { Link } from 'react-router-dom';
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LoginSplitQuoteImage01 } from '@/components/shared-assets/login/login-split-quote-image-01';
import { parseApiErrorBody } from '@/lib/api/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(parseApiErrorBody(data, 'Не удалось отправить запрос'));
        return;
      }
      setSent(true);
      toast.success('Запрос отправлен');
    } catch {
      toast.error('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginSplitQuoteImage01
      title="Восстановление пароля"
      subtitle="Укажите email аккаунта — мы отправим инструкцию"
      footer={
        <p className="text-center text-sm text-tertiary">
          <Link to="/login" className="font-medium text-brand-secondary hover:underline">
            Вернуться ко входу
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4 text-sm text-secondary">
          <p>Если email зарегистрирован, инструкция по восстановлению отправлена.</p>
          <p>
            Не пришло письмо? Напишите в{' '}
            <a
              href="https://t.me/Orion434"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-secondary hover:underline"
            >
              Telegram @Orion434
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            isRequired
            placeholder="your@email.com"
          />
          <Button type="submit" color="primary" size="lg" className="w-full" isDisabled={loading}>
            {loading ? 'Отправляем...' : 'Отправить'}
          </Button>
        </form>
      )}
    </LoginSplitQuoteImage01>
  );
}
