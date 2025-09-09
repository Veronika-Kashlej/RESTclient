'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/sign-in');
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, [router]);

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>Redirecting to sign in...</div>;

    return <WrappedComponent {...props} />;
  };
}
