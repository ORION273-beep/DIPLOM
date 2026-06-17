import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { ReviewForm } from '@/components/commerce/ReviewForm';
import { serverApiUrl } from '@/lib/api/client';

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

async function getReviews(): Promise<{ reviews: Review[]; error: string | null }> {
  try {
    const res = await fetch(serverApiUrl('/api/reviews'), { cache: 'no-store' });
    if (!res.ok) {
      return { reviews: [], error: 'Не удалось загрузить отзывы' };
    }
    const data = await res.json();
    return { reviews: data.reviews ?? [], error: null };
  } catch {
    return { reviews: [], error: 'Сервер недоступен' };
  }
}

export default async function ReviewsPage() {
  const { reviews, error } = await getReviews();

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Community"
        title="Отзывы клиентов"
        description="Публикуем обратную связь от покупателей, чтобы вы могли оценить уровень сервиса до первой покупки."
      />

      <div className="container mx-auto px-4 pb-10">
        {error ? (
          <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-10 text-center text-red-200">{error}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <SectionCard key={review.id} className="border-secondary bg-secondary">
                <SectionCardHeader>
                  <SectionCardTitle className="text-primary">{review.author}</SectionCardTitle>
                  <SectionCardDescription className="text-amber-300">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </SectionCardDescription>
                </SectionCardHeader>
                <SectionCardContent className="text-secondary">{review.text}</SectionCardContent>
              </SectionCard>
            ))}
          </div>
        )}

        <ReviewForm />
      </div>
    </section>
  );
}
