import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (isMountedRef.current) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const userObject = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          userName: userData.userName || firebaseUser.displayName,
          phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber,
          buildingId: userData.buildingId || null,
          role: userData.role || 'tenant',
          ...userData,
        };

        if (isMountedRef.current) {
          console.log("User data loaded:", userObject);
          setUser(userObject);
          setIsAdmin(userData.role === 'admin');
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        if (isMountedRef.current) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          setIsAdmin(false);
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
};
