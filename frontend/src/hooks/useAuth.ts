import {useState, useEffect} from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db} from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const useAuth = () => {;
    const [user, setUser] = useState<any>(null);
    const [firebaseUser, loading, error] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const fetchUser = async (firebaseUser : FirebaseUser) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()){
                    const userData = userDoc.data();
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...userData
                    });
                    setIsAdmin(userData.isAdmin || false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        if (firebaseUser) {
            fetchUser(firebaseUser);
        } else {
            setUser(null);
            setIsAdmin(false);
        }

    return
}, [firebaseUser]);
    return { user, isAdmin, loading, error };
}