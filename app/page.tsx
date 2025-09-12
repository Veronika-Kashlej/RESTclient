'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/authContext/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-up');
    }
  }, [user, authLoading, router]);

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

  if (authLoading) return <p>Loading...</p>;

  if (!user) return null;

  if (loading) return <p>Loading...</p>;

  if (authError) return <p>Error: {authError}</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <p>Postman clone is here</p>
      <p>Welcome, {user.email}</p>
      <div className="h3">
        A simple example query to Firebase works and was placed here:
        <p>{message}</p>
      </div>
      <button className="signup-btn" onClick={() => signOut()}>
        Logout
      </button>
    </>
  );
}
