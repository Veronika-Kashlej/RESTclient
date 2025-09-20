'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

import { useRouter } from 'next/navigation';

import { db } from '../firebase/firebase';

type HeaderItem = {
  key: string;
  value: string;
};

type BodyType = 'json' | 'text' | 'form-data' | 'none';

type RequestRecord = {
  id: string;
  method: string;
  url: string;
  status: number;
  timingMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  timestamp: Timestamp;
  headers: Record<string, string>;
  bodyType: BodyType;
  bodyContent: string;
};

export default function HistoryComponent() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
          ({
            id,
            method,
            url,
            status,
            timingMs,
            requestSizeBytes,
            responseSizeBytes,
            headers,
            bodyContent,
          }) => (
            <li
              key={id}
              onClick={() => {
                const params = new URLSearchParams();
                params.set('method', method);
                params.set('url', encodeURIComponent(url));
                const requestHeaders: HeaderItem[] = [];
                params.set('headers', encodeURIComponent(JSON.stringify(requestHeaders)));
                params.set('bodyType', 'json');
                params.set('bodyContent', encodeURIComponent(''));
                params.set('responseStatus', status.toString());
                params.set('responseHeaders', encodeURIComponent(JSON.stringify(headers || {})));
                params.set('responseBody', encodeURIComponent(bodyContent || ''));
                params.set('responseTime', timingMs.toString());
                router.push(`/client?${params.toString()}`);
              }}
              style={{ cursor: 'pointer' }}
            >
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
                <div className="h3">response headers:</div>
                <div className="h4">
                  {headers && Object.entries(headers).length > 0 ? (
                    Object.entries(headers).map(([key, value]) => (
                      <div key={key} className="header-item">
                        <span className="header-key">{key}:</span>
                        <span className="header-value">{value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="header-value">(no headers)</span>
                  )}
                </div>
              </div>
              <div className="history-el">
                <div className="h3">response body:</div>
                <div className="h4 response-body-preview">
                  {bodyContent && bodyContent.length > 100
                    ? `${bodyContent.substring(0, 100)}...`
                    : bodyContent || '(empty)'}
                </div>
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
