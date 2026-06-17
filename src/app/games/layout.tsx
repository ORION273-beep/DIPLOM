import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Игры — OneSec',
  description: 'Каталог игр с донатами, валютой и подписками',
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
