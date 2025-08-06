
import { Suspense } from 'react';
import { CategoryContent } from '@/components/category/category-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Autohipnosis - Calmify',
  description: 'Transforma tu mente con sesiones de autohipnosis profesionales para el crecimiento personal y bienestar.',
};

export default function HypnosisPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CategoryContent categoryType="HYPNOSIS" />
    </Suspense>
  );
}
