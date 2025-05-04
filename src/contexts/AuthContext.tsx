import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Google Sign In
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if it's a new user and create Firestore doc if needed
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    googleSignIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 