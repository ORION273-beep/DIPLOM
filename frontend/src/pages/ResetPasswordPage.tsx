import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { LoginSplitQuoteImage01 } from '@/components/shared-assets/login/login-split-quote-image-01';
import { parseApiErrorBody } from '@/lib/api/errors';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Ссылка недействительна');
      return;
    }
    if (password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirm) {
      toast.error('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(parseApiErrorBody(data, 'Не удалось сбросить пароль'));
        return;
      }
      setDone(true);
      toast.success('Пароль изменён');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <LoginSplitQuoteImage01
        title="Сброс пароля"
        subtitle="Ссылка недействительна или отсутствует"
        footer={
          <p className="text-center text-sm text-tertiary">
            <Link to="/forgot-password" className="font-medium text-brand-secondary hover:underline">
              Запросить новую ссылку
            </Link>
          </p>
        }
      >
        <p className="text-sm text-secondary">
          Перейдите на страницу восстановления пароля и укажите email аккаунта.
        </p>
      </LoginSplitQuoteImage01>
    );
  }

  return (
    <LoginSplitQuoteImage01
      title="Новый пароль"
      subtitle="Придумайте новый пароль для входа"
      footer={
        <p className="text-center text-sm text-tertiary">
          <Link to="/login" className="font-medium text-brand-secondary hover:underline">
            Вернуться ко входу
          </Link>
        </p>
      }
    >
      {done ? (
        <p className="text-sm text-secondary">Пароль обновлён. Перенаправляем на страницу входа…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Новый пароль"
            type="password"
            value={password}
            onChange={setPassword}
            isRequired
            placeholder="Минимум 6 символов"
          />
          <Input
            label="Подтвердите пароль"
            type="password"
            value={confirm}
            onChange={setConfirm}
            isRequired
          />
          <Button type="submit" color="primary" size="lg" className="w-full" isDisabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить пароль'}
          </Button>
        </form>
      )}
    </LoginSplitQuoteImage01>
  );
}
