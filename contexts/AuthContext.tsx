import { auth, db } from "@/services/firebase";
import { signOut as fbSignOut, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Role = "super_admin" | "admin" | "none";

type AuthContextType = {
  user: import("firebase/auth").User | null;
  role: Role;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<Role>("none");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      // Upsert users/{uid} for Manage Users listing
      // Note: Role harus di-set manual melalui halaman Users atau Firestore Console
      // User pertama perlu di-set role="super_admin" secara manual di Firestore Console
      if (u) {
        const userRef = doc(db, "users", u.uid);
        await setDoc(userRef, {
          uid: u.uid,
          email: u.email ?? null,
          displayName: u.displayName ?? null,
          photoURL: u.photoURL ?? null,
          updatedAt: serverTimestamp(),
          // Role tidak di-set otomatis, harus di-set manual
          // Default: tidak ada field role = "none"
        }, { merge: true });
      }
    });
    return () => unsub();
  }, []);

  // Listen untuk perubahan role dari Firestore
  useEffect(() => {
    if (!user?.uid) {
      setRole("none");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        const userRole = userData?.role as Role | undefined;
        // Validasi role, default ke "none" jika invalid
        if (userRole === "super_admin" || userRole === "admin") {
          setRole(userRole);
        } else {
          setRole("none");
        }
      } else {
        setRole("none");
      }
    }, (error) => {
      console.error("Error listening to user role:", error);
      setRole("none");
    });

    return () => unsub();
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  const value = useMemo<AuthContextType>(() => ({ user, role, loading, signInWithGoogle, signOut }), [user, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


