import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог — OneSec',
  description: 'Игровая валюта и подписки по выгодным ценам',
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
