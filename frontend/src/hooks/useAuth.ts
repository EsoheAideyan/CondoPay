import {useState, useEffect, useRef} from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db} from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [firebaseUser, loading, error] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [userLoading, setUserLoading] = useState<boolean>(false);
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Monitor user state changes
    useEffect(() => {
        console.log('User state changed to:', user);
    }, [user]);

    useEffect(() => {
        const fetchUser = async (firebaseUser : FirebaseUser) => {
            if (!isMountedRef.current) return;
            
            setUserLoading(true);
            try {
                console.log('Fetching user data for:', firebaseUser.uid);
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                
                if (!isMountedRef.current) return;
                
                if (userDoc.exists()){
                    const userData = userDoc.data();
                    console.log('User data found:', userData);
                    
                    const userObject = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        userName: userData.userName || userData.displayName || firebaseUser.displayName,
                        ...userData
                    };
                    
                    console.log('Setting user object:', userObject);
                    setUser(userObject);
                    setIsAdmin(userData.role === 'admin');
                    console.log('User state set, isAdmin:', userData.role === 'admin');
                } else {
                    console.log('User document does not exist in Firestore');
                    // Set basic user info even if Firestore document doesn't exist
                    const userObject = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        userName: firebaseUser.displayName
                    };
                    console.log('Setting basic user object:', userObject);
                    setUser(userObject);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (!isMountedRef.current) return;
                
                // Set basic user info even if there's an error
                const userObject = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    userName: firebaseUser.displayName
                };
                console.log('Setting user object after error:', userObject);
                setUser(userObject);
                setIsAdmin(false);
            } finally {
                if (isMountedRef.current) {
                    setUserLoading(false);
                }
            }
        };
        
        if (firebaseUser) {
            fetchUser(firebaseUser);
        } else {
            console.log('No Firebase user, clearing user state');
            if (isMountedRef.current) {
                setUser(null);
                setIsAdmin(false);
                setUserLoading(false);
            }
        }
    }, [firebaseUser]);

    // Combine loading states
    const isLoading = loading || userLoading;

    console.log('useAuth hook state - user:', user, 'isAdmin:', isAdmin, 'loading:', isLoading);

    return { user, isAdmin, loading: isLoading, error };
};