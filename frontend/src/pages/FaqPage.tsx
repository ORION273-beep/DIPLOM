import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { FAQAccordion03Brand } from '@/components/marketing/faq/faq-accordion-03-brand';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { PageLoader } from '@/components/ui/PageLoader';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/faq');
        if (!res.ok) {
          if (!cancelled) setError('Не удалось загрузить FAQ');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Сервер недоступен');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader label="Загрузка FAQ..." />;

  return (
    <>
      <HeaderCentered
        eyebrow="Справочный центр OneSec"
        title="Частые вопросы"
        description="Ответы на самые частые вопросы по оплате, доставке цифровых товаров и работе аккаунта."
      />

      {error ? (
        <div className="container mx-auto px-4 pb-10">
          <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-10 text-center text-red-200">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="container mx-auto px-4 pb-10 text-center text-tertiary">Вопросы скоро появятся</div>
      ) : (
        <FAQAccordion03Brand
          items={items}
          eyebrow="Справочный центр"
          title="Частые вопросы"
          description="Ответы на вопросы по оплате, доставке и аккаунту. Не нашли ответ?"
          supportHref="/contacts"
          supportLabel="Свяжитесь с поддержкой"
        />
      )}

      <div className="container mx-auto flex flex-wrap gap-3 px-4 py-10">
        <Button color="primary" href="/contacts">
          Связаться с поддержкой
        </Button>
        <Button color="secondary" href="/rules">
          Правила магазина
        </Button>
      </div>
    </>
  );
}
