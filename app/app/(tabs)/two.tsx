import { useState, useEffect, useCallback } from "react";
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
import { FileText, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { getCurrencySymbol, formatAmount } from "../../utils/currency";

interface Invoice {
  id: string;
  project_name: string;
  date: Timestamp | Date | string;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("user_id", "==", user.uid),
      orderBy("date", "desc"),
    );

    const unsubscribeInvoices = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedInvoices: Invoice[] = [];
        querySnapshot.forEach((doc) => {
          fetchedInvoices.push({ id: doc.id, ...doc.data() } as Invoice);
        });

        fetchedInvoices.sort((a, b) => {
          const dateA =
            typeof a.date === "string"
              ? a.date
              : (a.date as any)?.toDate?.()?.toISOString() || "";
          const dateB =
            typeof b.date === "string"
              ? b.date
              : (b.date as any)?.toDate?.()?.toISOString() || "";

          if (dateA !== dateB) {
            return dateB.localeCompare(dateA);
          }

          const timeA = a.created_at || 0;
          const timeB = b.created_at || 0;
          return timeB - timeA;
        });

        setInvoices(fetchedInvoices);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (err: any) => {
        console.error("Error fetching invoices:", err);
        if (err.message?.includes("index")) {
          setError(
            "Database index is building. Please try again in a few minutes.",
          );
        } else {
          setError("Failed to load invoices. Pull to refresh.");
        }
        setLoading(false);
        setRefreshing(false);
      },
    );

    return () => {
      unsubscribeInvoices();
    };
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";

    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    let dateObj = new Date(timestamp);

    if (typeof timestamp === "string") {
      const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        dateObj = new Date(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1,
          parseInt(match[3], 10),
        );
      }
    }

    if (isNaN(dateObj.getTime())) {
      return String(timestamp);
    }

    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    if (amount === undefined || amount === null) return "$0.00";

    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${formatAmount(amount)}`;
  };

  const handleDelete = (item: Invoice) => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (
                item.media_url &&
                item.media_url.includes("firebasestorage")
              ) {
                try {
                  const mediaRef = ref(storage, item.media_url);
                  await deleteObject(mediaRef);
                } catch (mediaErr) {
                  console.error(
                    "Failed to delete media from storage:",
                    mediaErr,
                  );
                }
              }
              await deleteDoc(doc(db, "invoices", item.id));
            } catch (error: any) {
              console.error("Error deleting invoice:", error);
              Alert.alert(
                "Error",
                "Failed to delete invoice: " + error.message,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Your generated quotes</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
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
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/invoice/${item.id}`)}
            >
              <View
                style={[
                  styles.cardAccent,
                  item.status === "processing"
                    ? styles.cardAccentProcessing
                    : null,
                ]}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.iconContainer}>
                      <FileText color="#818CF8" size={20} />
                    </View>
                    <View style={[styles.badgeContainer, { marginLeft: 12 }]}>
                      <Text style={styles.badgeText}>Invoice</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.deleteButton}
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.project_name || "Untitled Invoice"}
                </Text>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                  {item.status === "processing" ? (
                    <View style={styles.processingBadge}>
                      <ActivityIndicator size="small" color="#818CF8" />
                      <Text style={styles.processingBadgeText}>Processing</Text>
                    </View>
                  ) : (
                    <Text style={styles.cardAmount}>
                      {formatCurrency(item.total, item.currency)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <FileText color="#4F46E5" size={36} />
              </View>
              <Text style={styles.emptyStateTitle}>No invoices yet</Text>
              <Text style={styles.emptyStateSub}>
                Record a video or describe your project to generate your first
                quote.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#71717A",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cardAccent: {
    width: 3,
    backgroundColor: "#4F46E5",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardAccentProcessing: {
    backgroundColor: "#818CF8",
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  badgeText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4F4F5",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 13,
    color: "#71717A",
    fontWeight: "500",
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  processingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
  },
  processingBadgeText: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.2)",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#27272A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "500",
  },
});
