import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Отзывы — OneSec',
  description: 'Отзывы покупателей о сервисе OneSec',
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
