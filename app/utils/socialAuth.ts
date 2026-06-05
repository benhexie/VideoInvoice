import { Platform } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as Crypto from "expo-crypto";
import { AppleAuthProvider, FirebaseAuthTypes, GoogleAuthProvider } from "@react-native-firebase/auth";
import { auth, db, GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from "../firebaseConfig";

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: Platform.OS === "ios" ? GOOGLE_IOS_CLIENT_ID : undefined,
  offlineAccess: false,
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) throw new Error("Google Sign-In did not return an ID token.");
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(credential);

  // Sync name + photo to Firestore so the profile page shows them immediately.
  const { displayName, photoURL } = userCredential.user;
  const update: Record<string, string> = {};
  if (displayName) update.name = displayName;
  if (photoURL) update.photoURL = photoURL;
  if (Object.keys(update).length) {
    await db().collection("users").doc(userCredential.user.uid).set(update, { merge: true });
  }

  return userCredential;
}

export async function signInWithApple() {
  // Dynamically imported so Android never bundles the native module
  const AppleAuthentication = await import("expo-apple-authentication");

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Apple Sign-In is not available on this device.");
  }

  const rawNonce = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  console.log({appleCredential});

  if (!appleCredential.identityToken) {
    throw new Error("Apple Sign-In did not return an identity token.");
  }

  const oauthCredential = AppleAuthProvider.credential(
    appleCredential.identityToken,
    rawNonce,
  );

  const userCredential = await auth().signInWithCredential(oauthCredential);

  // Apple only provides the full name on the very first sign-in.
  // Always write to Firestore when the name is present this session;
  // only skip updateProfile if Firebase Auth already has a displayName.
  const { givenName, familyName } = appleCredential.fullName ?? {};
  const update: Record<string, string> = {};
  if (givenName) {
    const displayName = [givenName, familyName].filter(Boolean).join(" ");
    if (!userCredential.user.displayName) {
      await userCredential.user.updateProfile({ displayName });
    }
    update.name = displayName;
  }
  if (userCredential.user.photoURL) update.photoURL = userCredential.user.photoURL;
  if (Object.keys(update).length) {
    await db().collection("users").doc(userCredential.user.uid).set(update, { merge: true });
  }

  return userCredential;
}

export async function reauthenticateWithGoogle(user: FirebaseAuthTypes.User) {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) throw new Error("Google Sign-In did not return an ID token.");
  const credential = GoogleAuthProvider.credential(idToken);
  await user.reauthenticateWithCredential(credential);
}

export async function reauthenticateWithApple(user: FirebaseAuthTypes.User) {
  const AppleAuthentication = await import("expo-apple-authentication");
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) throw new Error("Apple Sign-In is not available on this device.");

  const rawNonce = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!appleCredential.identityToken) throw new Error("Apple Sign-In did not return an identity token.");

  const oauthCredential = AppleAuthProvider.credential(appleCredential.identityToken, rawNonce);
  await user.reauthenticateWithCredential(oauthCredential);
}

export function getSocialAuthError(error: any): string | null {
  const code = error?.code;

  console.error("[SocialAuth] error:", code, error?.message, error);

  // User cancelled — treat as silent
  if (
    code === statusCodes.SIGN_IN_CANCELLED ||
    code === "ERR_REQUEST_CANCELED" ||
    error?.message?.includes("cancel")
  ) {
    return null;
  }
  if (code === statusCodes.IN_PROGRESS) return null;
  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return "Google Play Services is not available on this device.";
  }

  // Apple-specific availability error
  if (error?.message?.includes("not available")) {
    return "Sign in with Apple is not available on this device.";
  }

  // Firebase auth errors
  if (code === "auth/invalid-credential" || code === "auth/invalid-verification-code") {
    return "Apple credential was invalid. Please try again.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Please check your connection.";
  }

  return "Sign-in failed. Please try again.";
}
