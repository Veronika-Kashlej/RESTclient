'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../components/auth/withAuth';

const HistoryComponent = dynamic(() => import('./HistoryComponent'), {
  loading: () => <div>Loading History...</div>,
  ssr: false,
});

function History() {
  return (
    <Suspense fallback={<div>Loading History...</div>}>
      <HistoryComponent />
    </Suspense>
  );
}

export default withAuth(History);
