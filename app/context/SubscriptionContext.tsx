import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { useAuth } from "./AuthContext";

// TODO: Replace with your RevenueCat API keys from the RC dashboard
// Dashboard → Project Settings → API Keys
const IOS_RC_KEY = "test_LTOYNCPEXuzeOlytVgaDOhuSjXG";
const ANDROID_RC_KEY = "test_LTOYNCPEXuzeOlytVgaDOhuSjXG";

const ENTITLEMENT_ID = "VideoInvoice Pro";

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

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  const updateFromCustomerInfo = (info: CustomerInfo) => {
    setIsPro(typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined");
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

  // Tie RC identity to Firebase UID
  useEffect(() => {
    const syncIdentity = async () => {
      try {
        if (user?.uid) {
          const { customerInfo } = await Purchases.logIn(user.uid);
          updateFromCustomerInfo(customerInfo);
        } else {
          const isAnon = await Purchases.isAnonymous();
          if (!isAnon) await Purchases.logOut();
          setIsPro(false);
        }
      } catch (e) {
        console.error("RC identity sync error:", e);
      }
    };

    syncIdentity();
  }, [user?.uid]);

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
