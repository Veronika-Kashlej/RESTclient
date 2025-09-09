'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../components/auth/withAuth';

// Lazy load the actual Variables component
const VariablesComponent = dynamic(() => import('./VariablesComponent'), {
  loading: () => <div>Loading Variables...</div>,
  ssr: false,
});

function Variables() {
  return (
    <Suspense fallback={<div>Loading Variables...</div>}>
      <VariablesComponent />
    </Suspense>
  );
}

// Wrap with authentication HOC
export default withAuth(Variables);
