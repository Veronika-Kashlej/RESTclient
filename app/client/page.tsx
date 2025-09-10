'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../components/auth/withAuth';

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  loading: () => <div>Loading REST Client...</div>,
  ssr: false,
});

function Client() {
  return (
    <Suspense fallback={<div>Loading REST Client...</div>}>
      <ClientComponent />
    </Suspense>
  );
}

export default withAuth(Client);
