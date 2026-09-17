import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform, Alert, AppState } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useAuth } from "./AuthContext";

// TODO: Replace with your RevenueCat API keys from the RC dashboard
// Dashboard → Project Settings → API Keys
const IOS_RC_KEY = "test_LTOYNCPEXuzeOlytVgaDOhuSjXG";
const ANDROID_RC_KEY = "test_LTOYNCPEXuzeOlytVgaDOhuSjXG";

const ENTITLEMENT_ID = "VideoInvoice Pro";

// Set via the Firebase Auth custom claim `proOverride` (see
// api/node_server/grant-pro.js). Only the Admin SDK can set custom claims, so
// this can never be granted by the client itself — it fully bypasses RevenueCat
// for comped/reviewer/promo accounts.
type ProOverride = {
  active: boolean;
  expiresAt: number | null; // ms epoch; null = unlimited
};

type SubscriptionContextType = {
  isPro: boolean;
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  purchasePro: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  isLoading: true,
  offerings: null,
  purchasePro: async () => false,
  restorePurchases: async () => {},
});

const readProOverride = (
  claims: Record<string, unknown> | undefined,
): ProOverride | null => {
  const claim = claims?.proOverride as
    | { active?: boolean; expiresAt?: number | null }
    | undefined;
  if (!claim?.active) return null;
  return { active: true, expiresAt: claim.expiresAt ?? null };
};

const isOverrideActive = (override: ProOverride | null): boolean => {
  if (!override?.active) return false;
  return override.expiresAt === null || override.expiresAt > Date.now();
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isProFromRC, setIsProFromRC] = useState(false);
  const [proOverride, setProOverride] = useState<ProOverride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  const updateFromCustomerInfo = (info: CustomerInfo) => {
    setIsProFromRC(typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined");
  };

  const refreshProOverride = async (usr: FirebaseAuthTypes.User | null, forceRefresh = false) => {
    if (!usr) {
      setProOverride(null);
      return;
    }
    try {
      const tokenResult = await usr.getIdTokenResult(forceRefresh);
      setProOverride(readProOverride(tokenResult.claims));
    } catch (e) {
      console.error("Error refreshing pro override claim:", e);
    }
  };

  // Configure RC once on mount
  useEffect(() => {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    const apiKey = Platform.OS === "ios" ? IOS_RC_KEY : ANDROID_RC_KEY;
    Purchases.configure({ apiKey });

    const init = async () => {
      try {
        const [info, available] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);
        updateFromCustomerInfo(info);
        if (available.current) setOfferings(available.current);
      } catch (e) {
        console.error("RC init error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Tie RC identity to Firebase UID, and pick up any admin-granted pro override
  // (force-refresh the ID token so a freshly granted claim is seen immediately).
  useEffect(() => {
    const syncIdentity = async () => {
      try {
        if (user?.uid) {
          const { customerInfo } = await Purchases.logIn(user.uid);
          updateFromCustomerInfo(customerInfo);
        } else {
          const isAnon = await Purchases.isAnonymous();
          if (!isAnon) await Purchases.logOut();
          setIsProFromRC(false);
        }
      } catch (e) {
        console.error("RC identity sync error:", e);
      }
      await refreshProOverride(user, true);
    };

    syncIdentity();
  }, [user?.uid]);

  // Custom claims only land in the ID token after it refreshes, which can take
  // up to an hour on its own — force a refresh whenever the app returns to the
  // foreground so a grant/revoke made while the app was open/backgrounded
  // takes effect promptly.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshProOverride(user, true);
    });
    return () => subscription.remove();
  }, [user?.uid]);

  // A time-limited override needs a re-render right at expiry, even if
  // nothing else changes in the meantime, so `isPro` flips off on schedule.
  const [, forceTick] = useState(0);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    if (proOverride?.active && proOverride.expiresAt !== null) {
      const delay = proOverride.expiresAt - Date.now();
      if (delay > 0) {
        expiryTimer.current = setTimeout(() => forceTick((t) => t + 1), delay);
      }
    }
    return () => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
  }, [proOverride]);

  const isPro = isProFromRC || isOverrideActive(proOverride);

  const purchasePro = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      updateFromCustomerInfo(customerInfo);
      const isProActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
      return isProActive;
    } catch (e: any) {
      if (e?.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert("Purchase Failed", e?.message ?? "Something went wrong. Please try again.");
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      updateFromCustomerInfo(info);
      const restored = typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
      Alert.alert(
        restored ? "Pro Restored" : "Nothing to Restore",
        restored
          ? "Your Pro subscription has been restored."
          : "No active subscription found for this account."
      );
    } catch (e: any) {
      Alert.alert("Restore Failed", e?.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoading, offerings, purchasePro, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
