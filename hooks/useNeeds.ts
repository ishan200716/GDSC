import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CommunityNeed } from '../types';
import toast from 'react-hot-toast';

export function useNeeds() {
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'needs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const needsData: CommunityNeed[] = [];
      snapshot.forEach((doc) => {
        needsData.push({ id: doc.id, ...doc.data() } as CommunityNeed);
      });
      setNeeds(needsData);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching needs snapshot:', err);
      const msg = err.code === 'permission-denied'
        ? 'Access denied — check Firestore rules'
        : err.code === 'unavailable'
        ? 'Network unavailable — retrying…'
        : 'Failed to sync with network';
      setError(msg);
      setLoading(false);

      toast.error(msg, {
        style: { background: '#1b1f2c', color: '#fff', border: '1px solid rgba(255,107,53,0.4)' },
        iconTheme: { primary: '#FF6B35', secondary: '#0f131f' },
      });
    });

    return () => unsubscribe();
  }, []);

  return { needs, loading, error };
}
