
import { Suspense } from 'react';
import { CategoryContent } from '@/components/category/category-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Meditaciones - Calmify',
  description: 'Encuentra paz interior con nuestras meditaciones guiadas y técnicas de mindfulness en Calmify.',
};

export default function MeditationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CategoryContent categoryType="MEDITATION" />
    </Suspense>
  );
}
