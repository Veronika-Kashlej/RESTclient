'use client';

import { useEffect } from 'react';
import styles from './error.module.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>Critical error!</h2>
            <p className={styles.message}>Please reload the page</p>
            <button onClick={() => reset()} className={styles.button}>
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
