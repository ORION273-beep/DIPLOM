import { Navigate, useParams } from 'react-router-dom';

export default function CatalogCategoryPage() {
  const { category = '' } = useParams<{ category: string }>();
  return <Navigate to={`/catalog?category=${encodeURIComponent(category)}`} replace />;
}
