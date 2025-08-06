
'use client';

import { Suspense } from 'react';
import { AuthContent } from './auth-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
