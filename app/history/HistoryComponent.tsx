'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

import { db } from '../firebase/firebase';

type RequestRecord = {
  id: string;
  method: string;
  url: string;
  status: number;
  timingMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  timestamp: Timestamp;
};

export default function HistoryComponent() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'requests'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const requestsData: RequestRecord[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RequestRecord, 'id'>),
        }));

        setRequests(requestsData);
      } catch {
        setError('Failed to load requests');
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <h1>Request History</h1>
      <p className="h2">View and manage your API request history.</p>
      {requests.length === 0 && <p>No requests found.</p>}
      <ul className="history-content">
        {requests.map(
          ({ id, method, url, status, timingMs, requestSizeBytes, responseSizeBytes }) => (
            <li key={id}>
              <div className="history-el _method">
                <div className="h3">method:</div>
                <p className="h4">{method}</p>
              </div>
              <div className="history-el">
                <div className="h3">url:</div>
                <p className="h4">{url}</p>
              </div>
              <div className="history-el">
                <div className="h3">status:</div>
                <p className="h4">{status}</p>
              </div>
              <div className="history-el">
                <div className="h3">timingMs:</div>
                <p className="h4">{timingMs.toFixed(2)} ms</p>
              </div>
              <div className="history-el">
                <div className="h3">requestSizeBytes:</div>
                <p className="h4">{requestSizeBytes}</p>
              </div>
              <div className="history-el">
                <div className="h3">responseSizeBytes:</div>
                <p className="h4">{responseSizeBytes}</p>
              </div>
            </li>
          )
        )}
      </ul>
      <div className="h3">
        <p>Request history interface will be implemented here.</p>
        <p>This is a placeholder page for the history route.</p>
      </div>
    </>
  );
}
