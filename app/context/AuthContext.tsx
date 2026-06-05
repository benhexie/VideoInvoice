import React, { createContext, useContext, useEffect, useState } from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { auth, db } from "../firebaseConfig";

export type UserProfile = {
  hasCompletedOnboarding?: boolean;
  hasSeenTutorial?: boolean;
  name?: string;
  photoURL?: string;
};

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let currentUid: string | null = null;

    // onUserChanged fires on sign-in/out AND on profile updates (e.g. displayName),
    // unlike onAuthStateChanged which only fires on sign-in/out.
    const unsubscribeAuth = auth().onUserChanged((usr: FirebaseAuthTypes.User | null) => {
      // Only re-subscribe to Firestore when the signed-in user actually changes.
      if (usr?.uid !== currentUid) {
        currentUid = usr?.uid ?? null;

        // Hold the loading state while we fetch the profile for the new user.
        // This prevents _layout.tsx from running navigation logic with a stale
        // (null) userProfile between the moment user is set and the Firestore
        // snapshot fires.
        setLoading(true);
        setUser(usr);

        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }

        if (usr) {
          const userRef = db().collection("users").doc(usr.uid);
          unsubscribeProfile = userRef.onSnapshot(
            (docSnap) => {
              if (docSnap.exists) {
                setUserProfile(docSnap.data() as UserProfile);
              } else {
                setUserProfile({ hasCompletedOnboarding: false });
              }
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching user profile:", error);
              // Treat as a new user so navigation isn't stuck.
              setUserProfile({ hasCompletedOnboarding: false });
              setLoading(false);
            },
          );
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        // Same user — profile update (e.g. displayName changed). Just refresh
        // the user object without touching loading or the Firestore subscription.
        setUser(usr);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
