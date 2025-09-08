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
        onClick={() =>
          signOut(auth).then(() => {
            router.push('./sign-in');
          })
        }
      >
        Logout
      </button>
      {/* <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p>
      <p className="h2">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus illum sint
        exercitationem nisi consequuntur ratione excepturi dolormolestiae iustosed veniam ducimus
        neque eligendi aspernatur quia quidem, natus harum quos.
      </p> */}
    </>
  );
}
