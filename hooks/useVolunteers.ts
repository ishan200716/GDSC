import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Volunteer } from '../types';
import toast from 'react-hot-toast';

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'volunteers'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const volunteersData: Volunteer[] = [];
      snapshot.forEach((doc) => {
        volunteersData.push({ id: doc.id, ...doc.data() } as Volunteer);
      });
      setVolunteers(volunteersData);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching volunteers snapshot:', err);
      const msg = err.code === 'permission-denied'
        ? 'Access denied — check Firestore rules'
        : err.code === 'unavailable'
        ? 'Network unavailable — retrying…'
        : 'Failed to sync with volunteers';
      setError(msg);
      setLoading(false);

      toast.error(msg, {
        style: { background: '#1b1f2c', color: '#fff', border: '1px solid rgba(255,107,53,0.4)' },
        iconTheme: { primary: '#FF6B35', secondary: '#0f131f' },
      });
    });

    return () => unsubscribe();
  }, []);

  return { volunteers, loading, error };
}
