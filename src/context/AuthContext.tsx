import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { checkIsUserAdmin } from '../firebase/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  unauthorizedDomain: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  authError: null,
  unauthorizedDomain: null,
  clearAuthError: () => {},
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
    setUnauthorizedDomain(null);
  };

  useEffect(() => {
    // Check redirect result if popup fell back to redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          setCurrentUser(result.user);
          try {
            const adminStatus = await checkIsUserAdmin(result.user.uid, result.user.email);
            setIsAdmin(adminStatus);
          } catch {
            setIsAdmin(false);
          }
        }
      })
      .catch((err) => {
        handleAuthException(err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminStatus = await checkIsUserAdmin(user.uid, user.email);
          setIsAdmin(adminStatus);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthException = (error: any) => {
    console.error('Firebase Auth Error:', error);
    const code = error?.code || '';
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/unauthorized-domain') {
      setUnauthorizedDomain(currentHost);
      setAuthError(
        `Domain "${currentHost}" is not authorized in Firebase Authentication. Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains.`
      );
    } else if (code === 'auth/popup-blocked') {
      setAuthError('Google sign-in popup was blocked by your browser. Please allow popups or redirect.');
    } else if (code === 'auth/popup-closed-by-user') {
      setAuthError('Sign-in popup was closed before completion. Please try again.');
    } else {
      setAuthError(error?.message || 'Authentication failed. Please try again.');
    }
  };

  const loginWithGoogle = async () => {
    clearAuthError();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error?.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          handleAuthException(redirectError);
          return;
        }
      }
      handleAuthException(error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    clearAuthError();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      handleAuthException(error);
    }
  };

  const logout = async () => {
    clearAuthError();
    await firebaseSignOut(auth);
  };

  const contextValue = useMemo(
    () => ({
      currentUser,
      isAdmin,
      loading,
      authError,
      unauthorizedDomain,
      clearAuthError,
      loginWithGoogle,
      loginWithEmail,
      logout,
    }),
    [currentUser, isAdmin, loading, authError, unauthorizedDomain]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
