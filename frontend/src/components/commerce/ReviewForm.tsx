import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { SectionCard, SectionCardContent, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { buildLoginUrl } from '@/lib/auth/redirect';
import { useAuthStore } from '@/lib/auth/store';

export function ReviewForm() {
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user) {
    return (
      <SectionCard className="mt-8 border-brand/30 bg-brand-solid/10">
        <SectionCardHeader>
          <SectionCardTitle className="text-brand-secondary">Оставить отзыв</SectionCardTitle>
        </SectionCardHeader>
        <SectionCardContent>
          <p className="mb-4 text-sm text-secondary">
            Войдите в аккаунт и завершите хотя бы один заказ, чтобы оставить отзыв.
          </p>
          <Button href={buildLoginUrl('/reviews')} color="primary">
            Войти
          </Button>
        </SectionCardContent>
      </SectionCard>
    );
  }

  if (sent) {
    return (
      <SectionCard className="mt-8 border-brand/30 bg-brand-solid/10">
        <SectionCardContent className="pt-6 text-secondary">
          Спасибо! Отзыв отправлен на модерацию и появится после проверки.
        </SectionCardContent>
      </SectionCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      toast.error('Отзыв должен содержать минимум 10 символов');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text: text.trim() }),
      });
      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось отправить отзыв'));
      }
      setSent(true);
      toast.success('Отзыв отправлен на модерацию');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard className="mt-8 border-brand/30 bg-brand-solid/10">
      <SectionCardHeader>
        <SectionCardTitle className="text-brand-secondary">Оставить отзыв</SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Оценка</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`rounded-lg px-3 py-1 text-lg ${rating >= n ? 'text-amber-400' : 'text-quaternary'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Ваш отзыв</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Расскажите о своём опыте покупки..."
              rows={4}
              required
              className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary outline-none focus:border-brand"
            />
          </div>
          <Button type="submit" color="primary" isDisabled={submitting}>
            {submitting ? 'Отправляем...' : 'Отправить отзыв'}
          </Button>
        </form>
      </SectionCardContent>
    </SectionCard>
  );
}
