
import { Suspense } from 'react';
import { CategoryContent } from '@/components/category/category-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Podcasts - Calmify',
  description: 'Descubre los mejores podcasts de crecimiento personal, negocios y tecnología en Calmify.',
};

export default function PodcastsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CategoryContent categoryType="PODCAST" />
    </Suspense>
  );
}
