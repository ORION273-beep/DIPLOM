import { useEffect, useState } from 'react';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { ReviewForm } from '@/components/commerce/ReviewForm';
import { PageLoader } from '@/components/ui/PageLoader';

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) {
          if (!cancelled) setError('Не удалось загрузить отзывы');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setReviews(data.reviews ?? []);
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

  if (loading) return <PageLoader label="Загрузка отзывов..." />;

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
