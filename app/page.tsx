'use client';

import { useEffect, useState } from 'react';
import { auth } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) return;

    async function fetchMessage() {
      try {
        const docRef = doc(db, 'testCollection', 'testDoc');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setMessage(docSnap.data().message);
        } else {
          setError('No such document!');
        }
      } catch (err) {
        setError('Failed to fetch document');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <>
      <p>Postman clone is here</p>
      <p>Welcome, {user.email}</p>
      <div className="h3">
        A simple example query to Firebase works and was placed here:
        <p>{message}</p>
      </div>
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
