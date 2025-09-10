'use client';

import { useEffect, useState } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/sign-up');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <p>Postman clone is here</p>
      <p>Welcome, {user.email}</p>
      <button
        className="signup-btn"
        onClick={() =>
          signOut(auth).then(() => {
            router.push('./sign-in');
          })
        }
      >
        Logout
      </button>
    </>
  );
}
