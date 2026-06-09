import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  X,
  Crown,
  Check,
  FileText,
  Layers,
  Zap,
} from "lucide-react-native";
import { PurchasesPackage } from "react-native-purchases";
import { useSubscription } from "../context/SubscriptionContext";
import { useTheme } from "../context/ThemeContext";
import { AppColors } from "../constants/Colors";

const FEATURES = [
  {
    icon: (c: string) => <Layers color={c} size={18} />,
    label: "Invoice Templates",
    free: "3 standard templates",
    pro: "All 6 templates (Premium, Elegant, Bold)",
  },
  {
    icon: (c: string) => <FileText color={c} size={18} />,
    label: "PDF Export",
    free: "Not available",
    pro: "Unlimited PDF exports",
  },
  {
    icon: (c: string) => <Zap color={c} size={18} />,
    label: "Invoice Creation",
    free: "Up to 5 invoices",
    pro: "Unlimited invoices",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { offerings, isPro, purchasePro, restorePurchases, isLoading } = useSubscription();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(
    offerings?.availablePackages?.[0] ?? null
  );
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Keep selected package in sync when offerings load
  React.useEffect(() => {
    if (!selectedPackage && offerings?.availablePackages?.[0]) {
      setSelectedPackage(offerings.availablePackages[0]);
    }
  }, [offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setIsPurchasing(true);
    const success = await purchasePro(selectedPackage);
    setIsPurchasing(false);
    if (success) router.back();
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    await restorePurchases();
    setIsRestoring(false);
  };

  // Already pro — just go back
  if (isPro) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.alreadyProContainer}>
          <LinearGradient colors={["#7C3AED", "#D4AF37"]} style={styles.crownCircle}>
            <Crown color="#fff" size={32} />
          </LinearGradient>
          <Text style={styles.alreadyProTitle}>You're already Pro!</Text>
          <Text style={styles.alreadyProSubtitle}>All features are unlocked.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.xBtn} onPress={() => router.back()} hitSlop={8}>
          <X color={colors.textSecondary} size={22} />
        </TouchableOpacity>
        <LinearGradient
          colors={["#7C3AED", "#D4AF37"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.proBadge}
        >
          <Crown color="#fff" size={13} />
          <Text style={styles.proBadgeText}>Pro</Text>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>Unlock the full power of VideoInvoice</Text>

        {/* Feature comparison */}
        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresColLabel} />
            <Text style={[styles.featuresColLabel, styles.freePlanLabel]}>Free</Text>
            <Text style={[styles.featuresColLabel, styles.proPlanLabel]}>Pro</Text>
          </View>
          {FEATURES.map((feat, i) => (
            <View
              key={feat.label}
              style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}
            >
              <View style={styles.featureLeft}>
                {feat.icon(colors.textSecondary)}
                <Text style={styles.featureLabel}>{feat.label}</Text>
              </View>
              <Text style={styles.featureFree}>{feat.free}</Text>
              <View style={styles.featureProCell}>
                <Check color="#7C3AED" size={13} style={{ marginRight: 3 }} />
                <Text style={styles.featurePro}>{feat.pro}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing packages */}
        {isLoading && !offerings ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 32 }} />
        ) : !offerings ? (
          <View style={styles.noOfferings}>
            <Text style={styles.noOfferingsText}>Unable to load pricing.</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {offerings.availablePackages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isAnnual =
                pkg.packageType === "ANNUAL" ||
                pkg.product.identifier.toLowerCase().includes("annual");
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  onPress={() => setSelectedPackage(pkg)}
                  activeOpacity={0.8}
                >
                  {isAnnual && (
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>Best Value</Text>
                    </View>
                  )}
                  <View style={styles.packageRow}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.packageName, isSelected && styles.packageNameSelected]}>
                      {isAnnual ? "Annual" : "Monthly"}
                    </Text>
                    <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                      {pkg.product.priceString}
                    </Text>
                  </View>
                  {isAnnual && (
                    <Text style={styles.packageSubtitle}>
                      {`${(pkg.product.price / 12).toLocaleString("en", { style: "currency", currency: pkg.product.currencyCode, maximumFractionDigits: 2 })} / month`}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, (!selectedPackage || isPurchasing) && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={!selectedPackage || isPurchasing}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#7C3AED", "#6D28D9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPackage
                  ? `Start Pro — ${selectedPackage.product.priceString}`
                  : "Select a plan"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator color={colors.textSecondary} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Fine print */}
        <Text style={styles.finePrint}>
          Billed monthly or annually. Cancel anytime in App Store or Google Play settings.
          Subscription renews automatically unless cancelled at least 24 hours before the end of
          the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    xBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceRaised,
      justifyContent: "center",
      alignItems: "center",
    },
    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
    },
    proBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },

    // Title
    title: {
      fontSize: 30,
      fontWeight: "800",
      color: c.textPrimary,
      letterSpacing: -0.5,
      marginTop: 8,
      marginBottom: 6,
    },
    subtitle: { fontSize: 16, color: c.textSecondary, marginBottom: 28 },

    // Feature comparison
    featuresCard: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 24,
      overflow: "hidden",
    },
    featuresHeader: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: c.surfaceRaised,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    featuresColLabel: { flex: 1, fontSize: 11, fontWeight: "700", color: c.textTertiary, letterSpacing: 0.5, textTransform: "uppercase" },
    freePlanLabel: { textAlign: "center" },
    proPlanLabel: { textAlign: "center", color: "#7C3AED" },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    featureRowBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    featureLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    featureLabel: { fontSize: 13, fontWeight: "600", color: c.textPrimary, flex: 1 },
    featureFree: { flex: 1, fontSize: 11, color: c.textTertiary, textAlign: "center" },
    featureProCell: { flex: 1, flexDirection: "row", alignItems: "flex-start", justifyContent: "center" },
    featurePro: { fontSize: 11, fontWeight: "600", color: "#7C3AED", flex: 1 },

    // Packages
    packagesContainer: { gap: 12, marginBottom: 24 },
    packageCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      padding: 16,
    },
    packageCardSelected: {
      borderColor: "#7C3AED",
      backgroundColor: "rgba(124,58,237,0.06)",
    },
    packageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: c.borderSubtle,
      justifyContent: "center",
      alignItems: "center",
    },
    radioOuterSelected: { borderColor: "#7C3AED" },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#7C3AED" },
    packageName: { flex: 1, fontSize: 16, fontWeight: "600", color: c.textPrimary },
    packageNameSelected: { color: "#7C3AED" },
    packagePrice: { fontSize: 16, fontWeight: "700", color: c.textPrimary },
    packagePriceSelected: { color: "#7C3AED" },
    packageSubtitle: { fontSize: 12, color: c.textSecondary, marginTop: 4, marginLeft: 32 },
    bestValueBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(212,175,55,0.15)",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 10,
    },
    bestValueText: { fontSize: 11, fontWeight: "700", color: "#D4AF37" },

    // CTA
    ctaButton: { borderRadius: 16, overflow: "hidden", marginBottom: 14 },
    ctaButtonDisabled: { opacity: 0.6 },
    ctaGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
    ctaText: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },

    // Restore
    restoreBtn: { alignItems: "center", paddingVertical: 12, marginBottom: 16 },
    restoreText: { color: c.textSecondary, fontSize: 14, fontWeight: "500" },

    // Fine print
    finePrint: {
      fontSize: 11,
      color: c.textDisabled,
      textAlign: "center",
      lineHeight: 16,
      paddingHorizontal: 8,
    },

    // No offerings fallback
    noOfferings: { alignItems: "center", paddingVertical: 32, gap: 12, marginBottom: 24 },
    noOfferingsText: { color: c.textSecondary, fontSize: 15 },
    retryText: { color: c.accent, fontSize: 14, fontWeight: "600" },

    // Already pro
    alreadyProContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
    crownCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
    alreadyProTitle: { fontSize: 24, fontWeight: "700", color: c.textPrimary },
    alreadyProSubtitle: { fontSize: 16, color: c.textSecondary },
    closeBtn: {
      marginTop: 8,
      backgroundColor: c.accent,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 14,
    },
    closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  });
