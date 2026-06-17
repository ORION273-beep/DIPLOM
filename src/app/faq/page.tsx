import { Button } from '@/components/base/buttons/button';
import { FAQAccordion03Brand } from '@/components/marketing/faq/faq-accordion-03-brand';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { serverApiUrl } from '@/lib/api/client';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

async function getFaq(): Promise<{ items: FaqItem[]; error: string | null }> {
  try {
    const res = await fetch(serverApiUrl('/api/faq'), { cache: 'no-store' });
    if (!res.ok) {
      return { items: [], error: 'Не удалось загрузить FAQ' };
    }
    const data = await res.json();
    return { items: data.items ?? [], error: null };
  } catch {
    return { items: [], error: 'Сервер недоступен' };
  }
}

export default async function FaqPage() {
  const { items, error } = await getFaq();

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
