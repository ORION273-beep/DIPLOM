'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SectionCard, SectionCardContent } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { useAuthStore } from '@/lib/auth/store';
import { apiFetch, logoutClient } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { useRouter } from '@/lib/navigation';
import { RequireAuth } from '@/lib/auth/guards';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const [createdAt, setCreatedAt] = useState<string | null>(user?.createdAt ?? null);
  const [balance, setBalance] = useState<number>(user?.balance ?? 0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (!res.ok) return;
        const data = await res.json();
        if (data.user) {
          if (data.user.createdAt) setCreatedAt(data.user.createdAt);
          if (typeof data.user.balance === 'number') setBalance(data.user.balance);
          const currentUser = useAuthStore.getState().user;
          const token = useAuthStore.getState().accessToken;
          if (currentUser && token) {
            setSession({ ...currentUser, ...data.user }, token);
          }
        }
      } catch {
        // ignore
      }
    };
    loadProfile();
  }, [setSession]);

  const handleLogout = async () => {
    await logoutClient();
    router.push('/login');
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Новый пароль должен быть не менее 6 символов');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await apiFetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось сменить пароль'));
      }
      toast.success('Пароль обновлён');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setChangingPassword(false);
    }
  };

  const registrationDate = createdAt
    ? new Date(createdAt).toLocaleDateString('ru-RU')
    : '—';

  return (
    <RequireAuth>
      <section>
        <HeaderCentered
          eyebrow="OneSec Account"
          title="Личный кабинет"
          description="Управление вашим аккаунтом и заказами"
        />
        <div className="container mx-auto px-4 pb-10">
          <div className="mx-auto max-w-2xl space-y-6">
            <SectionCard>
              <SectionCardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-secondary">Имя пользователя</h3>
                  <p className="text-primary">{user?.email?.split('@')[0]}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-secondary">Email</h3>
                  <p className="text-primary">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-secondary">Баланс OneSec</h3>
                  <p className="text-lg font-semibold text-brand-secondary">{balance.toLocaleString('ru-RU')} ₽</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-secondary">Дата регистрации</h3>
                  <p className="text-primary">{registrationDate}</p>
                </div>

                <div className="pt-4">
                  <Button href="/profile/orders" color="primary">
                    Мои заказы
                  </Button>
                </div>

                <div className="border-t border-secondary pt-4">
                  <Button color="secondary" className="w-full" onClick={handleLogout}>
                    Выйти из аккаунта
                  </Button>
                </div>
              </SectionCardContent>
            </SectionCard>

            <SectionCard>
              <SectionCardContent className="space-y-4 pt-6">
                <h3 className="text-md font-semibold text-primary">Смена пароля</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Текущий пароль"
                    type="password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    isRequired
                  />
                  <Input
                    label="Новый пароль"
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    isRequired
                  />
                  <Button type="submit" color="primary" isDisabled={changingPassword}>
                    {changingPassword ? 'Сохраняем...' : 'Обновить пароль'}
                  </Button>
                </form>
              </SectionCardContent>
            </SectionCard>
          </div>
        </div>
      </section>
    </RequireAuth>
  );
}
