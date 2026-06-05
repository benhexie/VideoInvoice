import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, FileText, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { db, storage } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { getCurrencySymbol, formatAmount } from "../../utils/currency";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

interface Invoice {
  id: string;
  project_name: string;
  date: any;
  total: number;
  status?: string;
  media_url?: string;
  prompt?: string;
  currency?: string;
  created_at?: number;
}

export default function InvoicesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    setLoading(true);
    setError(null);

    const q = db().collection("invoices").where("user_id", "==", user.uid).orderBy("date", "desc");

    const unsubscribeInvoices = q.onSnapshot(
      (querySnapshot) => {
        const fetchedInvoices: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          fetchedInvoices.push({ id: doc.id, ...doc.data() } as Invoice);
        });

        fetchedInvoices.sort((a, b) => {
          const dateA = typeof a.date === "string" ? a.date : (a.date as any)?.toDate?.()?.toISOString() || "";
          const dateB = typeof b.date === "string" ? b.date : (b.date as any)?.toDate?.()?.toISOString() || "";
          if (dateA !== dateB) return dateB.localeCompare(dateA);
          return (b.created_at || 0) - (a.created_at || 0);
        });

        setInvoices(fetchedInvoices);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (err: any) => {
        console.error("Error fetching invoices:", err);
        setError(err.message?.includes("index")
          ? "Database index is building. Please try again in a few minutes."
          : "Failed to load invoices. Pull to refresh.");
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => { unsubscribeInvoices(); };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    let dateObj = new Date(timestamp);
    if (typeof timestamp === "string") {
      const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) dateObj = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }
    if (isNaN(dateObj.getTime())) return String(timestamp);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    if (amount === undefined || amount === null) return "$0.00";
    return `${getCurrencySymbol(currencyCode)}${formatAmount(amount)}`;
  };

  const handleDelete = (item: Invoice) => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            if (item.media_url && item.media_url.includes("firebasestorage")) {
              try { await storage().refFromURL(item.media_url).delete(); } catch {}
            }
            await db().collection("invoices").doc(item.id).delete();
          } catch (error: any) {
            Alert.alert("Error", "Failed to delete invoice: " + error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Your generated quotes</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/invoice/${item.id}`)}
            >
              <View style={[styles.cardAccent, item.status === "processing" ? styles.cardAccentProcessing : null]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.iconContainer}>
                      <FileText color={colors.accentLight} size={20} />
                    </View>
                    <View style={[styles.badgeContainer, { marginLeft: 12 }]}>
                      <Text style={styles.badgeText}>Invoice</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                    <Trash2 color={colors.error} size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.project_name || "Untitled Invoice"}
                </Text>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                  {item.status === "processing" ? (
                    <View style={styles.processingBadge}>
                      <ActivityIndicator size="small" color={colors.accentLight} />
                      <Text style={styles.processingBadgeText}>Processing</Text>
                    </View>
                  ) : (
                    <Text style={styles.cardAmount}>{formatCurrency(item.total, item.currency)}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FileText color={colors.accent} size={36} />
              </View>
              <Text style={styles.emptyStateTitle}>No invoices yet</Text>
              <Text style={styles.emptyStateSub}>Record a video or describe your project to generate your first quote.</Text>
              <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/(tabs)/")}>
                <Camera color="#fff" size={18} />
                <Text style={styles.ctaButtonText}>Capture Your First Quote</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: "bold", color: c.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: c.textTertiary, marginTop: 4 },
  listContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 80 },
  card: {
    backgroundColor: c.surface, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, borderColor: c.border, overflow: "hidden",
    flexDirection: "row", shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  cardAccent: { width: 3, backgroundColor: c.accent, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  cardAccentProcessing: { backgroundColor: c.accentLight },
  cardContent: { flex: 1, padding: 20 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  iconContainer: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: c.accentSubtle, justifyContent: "center", alignItems: "center",
  },
  badgeContainer: {
    backgroundColor: "rgba(34,197,94,0.12)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
  },
  badgeText: { color: "#4ADE80", fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  deleteButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: c.errorSubtle, justifyContent: "center", alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: c.textPrimary, marginBottom: 12, letterSpacing: -0.2 },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDate: { fontSize: 13, color: c.textTertiary, fontWeight: "500" },
  cardAmount: { fontSize: 24, fontWeight: "800", color: c.textPrimary, letterSpacing: -0.5 },
  processingBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: c.accentSubtle, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: c.accentBorder,
  },
  processingBadgeText: { color: c.accentLight, fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 100, paddingHorizontal: 32 },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: c.accentSubtle, justifyContent: "center", alignItems: "center",
    marginBottom: 20, borderWidth: 1, borderColor: c.accentBorder,
  },
  emptyStateTitle: { fontSize: 20, fontWeight: "600", color: c.textPrimary, marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: c.textTertiary, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  ctaButton: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: c.accent, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  ctaButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: c.error, fontSize: 16, textAlign: "center", marginBottom: 16 },
});
