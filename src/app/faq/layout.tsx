import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — OneSec',
  description: 'Частые вопросы о покупках, оплате и доставке цифровых товаров',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
