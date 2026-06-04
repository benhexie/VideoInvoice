import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  Alert,
  PanResponder,
  Animated as RNAnimated,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  Share,
  Send,
  Edit2,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Trash2,
  Eye,
  Layout,
  DollarSign,
  Search,
} from "lucide-react-native";
import { CONFIG } from "../../config";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { getCurrencySymbol, searchCurrency, Currency, formatAmount } from "../../utils/currency";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

const INVOICE_TEMPLATES = [
  { id: "premium", name: "Premium", color: "#7C3AED", isPremium: true },
  { id: "elegant", name: "Elegant", color: "#D4AF37", isPremium: true },
  { id: "bold", name: "Bold", color: "#FF3366", isPremium: true },
  { id: "modern", name: "Modern", color: "#4F46E5" },
  { id: "classic", name: "Classic", color: "#10B981" },
  { id: "minimal", name: "Minimalist", color: "#F59E0B" },
];

// Template previews intentionally use literal paper/document colors
const InvoiceTemplatePreview = ({ type, color }: { type: string; color: string }) => {
  const dark = "#1a1a2e";
  if (type === "premium") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 3, width: 32, backgroundColor: color, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: 22, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
          </View>
          <Text style={{ fontSize: 7, color: "#fff", fontStyle: "italic", fontWeight: "700", letterSpacing: 1 }}>Invoice</Text>
        </View>
        <View style={{ height: 1, backgroundColor: color, opacity: 0.8 }} />
        <View style={{ flexDirection: "row", paddingHorizontal: 7, paddingVertical: 5 }}>
          <View style={{ flex: 1 }}>
            <View style={{ height: 1.5, width: "70%", backgroundColor: color, opacity: 0.7, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: "50%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 0.5, backgroundColor: "#e0e0e0" }} />
          <View style={{ flex: 1, paddingLeft: 6 }}>
            <View style={{ height: 1.5, width: "65%", backgroundColor: "#ccc", borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: "45%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
        </View>
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3.5, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ height: 1.5, width: "50%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "20%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
        </View>
        {[55, 42].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 7, paddingVertical: 3.5, borderBottomWidth: 0.5, borderBottomColor: "#eee" }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 7, paddingTop: 5 }}>
          <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 2 }}>
            <Text style={{ fontSize: 5, color: color, fontWeight: "700" }}>TOTAL  $8,250</Text>
          </View>
        </View>
      </View>
    );
  }
  if (type === "elegant") {
    const gold = "#c9a84c";
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 6 }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, justifyContent: "center", alignItems: "center", marginBottom: 3 }}>
            <Text style={{ fontSize: 8, color: "#fff", fontWeight: "700" }}>A</Text>
          </View>
          <View style={{ height: 2.5, width: 46, backgroundColor: color, borderRadius: 0.5, marginBottom: 1.5 }} />
          <View style={{ height: 1.5, width: 34, backgroundColor: "#bbb", borderRadius: 0.5, marginBottom: 5 }} />
          <View style={{ width: "80%", height: 1.5, backgroundColor: gold, marginBottom: 1.5 }} />
          <View style={{ width: "80%", height: 0.75, backgroundColor: gold, opacity: 0.5 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 7.5, fontStyle: "italic", color: color, fontWeight: "700" }}>Invoice</Text>
          <View style={{ height: 1.5, width: "30%", backgroundColor: "#ccc", borderRadius: 0.5, marginTop: 2 }} />
        </View>
        <View style={{ marginHorizontal: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 2.5, borderBottomWidth: 1.5, borderBottomColor: color }}>
            <View style={{ height: 1.5, width: "50%", backgroundColor: color, borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "18%", backgroundColor: color, borderRadius: 0.5 }} />
          </View>
          {[60, 44].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3.5, borderBottomWidth: 0.5, borderBottomColor: "#ece8e2" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "18%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (type === "bold") {
    const boldDark = "#1f2937";
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 4.5, width: 44, backgroundColor: "#fff", borderRadius: 0.5, marginBottom: 2.5 }} />
            <View style={{ height: 1.5, width: 28, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.22)" }} />
        </View>
        <View style={{ backgroundColor: boldDark, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.1)", letterSpacing: 3 }}>INV</Text>
          <View style={{ height: 1.5, width: "38%", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
        </View>
        {[58, 44].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 2.5 }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
          </View>
        ))}
      </View>
    );
  }
  if (type === "modern") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 6, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 8, paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: color, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 7, color: "#fff", fontWeight: "700" }}>A</Text>
            </View>
            <View>
              <View style={{ height: 2.5, width: 32, backgroundColor: "#111", borderRadius: 0.5, marginBottom: 1.5 }} />
              <View style={{ height: 1.5, width: 22, backgroundColor: "#ccc", borderRadius: 0.5 }} />
            </View>
          </View>
          <Text style={{ fontSize: 9, fontWeight: "700", color: color }}>INVOICE</Text>
        </View>
        {[60, 46, 53].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 2.5 }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
          </View>
        ))}
      </View>
    );
  }
  if (type === "classic") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ height: 4, backgroundColor: color }} />
        {[1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
            <View style={{ flex: 2, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginRight: 4 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ height: 2, backgroundColor: color }} />
      {[54, 42, 48].map((w, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 3.5 }}>
          <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "18%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
        </View>
      ))}
    </View>
  );
};

type LineItem = {
  id: string;
  description: string;
  unit_price: number;
  quantity: number;
  discount?: number;
  discount_percentage?: number;
};

type InvoiceData = {
  status?: "processing" | "completed";
  line_items: LineItem[];
  total: number;
  subtotal: number;
  taxes: number;
  project_name: string;
  date: string;
  transcript?: string;
  media_url?: string;
  prompt?: string;
  currency?: string;
  template?: string;
};

export default function InvoiceReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LineItem | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percentage">("amount");
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [isSavingManualEdit, setIsSavingManualEdit] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showOriginalRequest, setShowOriginalRequest] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyResults, setCurrencyResults] = useState<Currency[]>([]);
  const videoRef = useRef<Video>(null);

  const panY = useRef(new RNAnimated.Value(0)).current;
  const panYCurrency = useRef(new RNAnimated.Value(0)).current;
  const panYTemplate = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => { if (isEditing) panY.setValue(0); }, [isEditing]);
  useEffect(() => { if (showCurrencyModal) panYCurrency.setValue(0); }, [showCurrencyModal]);
  useEffect(() => { if (showTemplateModal) panYTemplate.setValue(0); }, [showTemplateModal]);

  const makePanResponder = (animValue: RNAnimated.Value, onDismiss: () => void) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: RNAnimated.event([null, { dy: animValue }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 1.5) onDismiss();
        else RNAnimated.spring(animValue, { toValue: 0, useNativeDriver: true }).start();
      },
    });

  const panResponder = useRef(makePanResponder(panY, () => setIsEditing(false))).current;
  const panResponderCurrency = useRef(makePanResponder(panYCurrency, () => setShowCurrencyModal(false))).current;
  const panResponderTemplate = useRef(makePanResponder(panYTemplate, () => setShowTemplateModal(false))).current;

  useEffect(() => {
    if (!user || !id) return;
    const unsubscribe = onSnapshot(doc(db, "invoices", id), (docSnap) => {
      if (docSnap.exists()) setInvoice(docSnap.data() as InvoiceData);
    });
    const unsubscribeSettings = onSnapshot(doc(db, "users", user.uid, "settings", "invoice"), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });
    return () => { unsubscribe(); unsubscribeSettings(); };
  }, [id, user]);

  const handleSendPrompt = async () => {
    if (!chatInput.trim() || !user) return;
    setIsProcessingEdit(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(CONFIG.api.endpoints.editQuote, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice_id: id, prompt: chatInput }),
      });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.error || "Failed to edit quote"); }
      setChatInput("");
    } catch (e) {
      console.error(e);
      alert("Failed to send edit prompt.");
    } finally { setIsProcessingEdit(false); }
  };

  const saveManualEdit = async () => {
    if (!selectedItem || !user || !id || !invoice) return;
    setIsEditing(false);
    setIsSavingManualEdit(true);
    try {
      const newPrice = parseFloat(editPrice);
      const newQuantity = parseInt(editQuantity, 10);
      let newDiscount = 0;
      let newDiscountPercentage: number | undefined = undefined;
      if (editDiscount.trim()) {
        const parsedDiscount = parseFloat(editDiscount);
        if (discountType === "percentage") { newDiscountPercentage = parsedDiscount; newDiscount = newPrice * newQuantity * (parsedDiscount / 100); }
        else { newDiscount = parsedDiscount; }
      }
      if (isNaN(newPrice) || isNaN(newQuantity) || isNaN(newDiscount)) throw new Error("Invalid input values");
      const updatedLineItems = (invoice.line_items || []).map((item) => {
        if (item.id !== selectedItem.id) return item;
        const { discount, discount_percentage, ...rest } = item;
        const updatedItem: any = { ...rest, unit_price: newPrice, quantity: newQuantity };
        if (newDiscount > 0) updatedItem.discount = newDiscount;
        if (newDiscountPercentage !== undefined) updatedItem.discount_percentage = newDiscountPercentage;
        return updatedItem;
      });
      const newSubtotal = updatedLineItems.reduce((sum, item) => sum + item.quantity * item.unit_price - (item.discount || 0), 0);
      const newTotal = newSubtotal + (invoice.taxes || 0);
      await setDoc(doc(db, "invoices", id), { line_items: updatedLineItems, subtotal: Number(newSubtotal.toFixed(2)), total: Number(newTotal.toFixed(2)) }, { merge: true });
    } catch (e) {
      console.error("Failed to save manual edit:", e);
      Alert.alert("Error", "Failed to save edit.");
    } finally { setIsSavingManualEdit(false); }
  };

  const currencySymbol = getCurrencySymbol(invoice?.currency);

  const generatePDF = async () => {
    if (!invoice || !user || !id || isExporting) return;
    setIsExporting(true);
    try {
      const customization = { ...(settings || {}) };
      if (invoice.template) customization.template = invoice.template;
      const token = await user.getIdToken();
      const res = await fetch(CONFIG.api.endpoints.exportQuote(id), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(customization),
      });
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || "Export failed"); }
      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const fileUri = `${FileSystem.cacheDirectory}invoice-${id}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: "base64" });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Export Invoice" });
      }
    } catch (e: any) {
      Alert.alert("Export Error", e.message || "Something went wrong while exporting.");
    } finally { setIsExporting(false); }
  };

  const saveInvoiceCurrency = async (code: string) => {
    if (!user || !id) return;
    try { await setDoc(doc(db, "invoices", id), { currency: code }, { merge: true }); } catch {}
    setShowCurrencyModal(false);
  };

  const saveInvoiceTemplate = async (templateId: string) => {
    if (!user || !id) return;
    try { await setDoc(doc(db, "invoices", id), { template: templateId }, { merge: true }); } catch {}
    setShowTemplateModal(false);
  };

  const handleDelete = () => {
    if (!invoice || !id) return;
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            if (invoice.media_url && invoice.media_url.includes("firebasestorage")) {
              try { await deleteObject(ref(storage, invoice.media_url)); } catch {}
            }
            await deleteDoc(doc(db, "invoices", id));
            Alert.alert("Deleted", "Invoice deleted successfully.");
            router.replace("/(tabs)/two");
          } catch (error: any) {
            Alert.alert("Error", "Failed to delete invoice: " + error.message);
          }
        },
      },
    ]);
  };

  const renderMediaPreview = () => {
    if (!invoice?.media_url) return null;
    const url = invoice.media_url.toLowerCase();
    if (url.includes(".mov") || url.includes(".mp4")) {
      return (
        <View style={styles.mediaWrapper}>
          <Video ref={videoRef} source={{ uri: invoice.media_url }} style={styles.mediaPreview} useNativeControls resizeMode={ResizeMode.COVER} isLooping={false} />
        </View>
      );
    }
    if (url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png")) {
      return (
        <View style={styles.mediaWrapper}>
          <Image source={{ uri: invoice.media_url }} style={styles.mediaPreview} resizeMode="cover" />
        </View>
      );
    }
    return (
      <TouchableOpacity style={styles.documentPreview} onPress={() => Linking.openURL(invoice.media_url!)}>
        <FileText color={colors.accentLight} size={32} />
        <Text style={styles.documentText}>View Attached Document</Text>
      </TouchableOpacity>
    );
  };

  if (!invoice || (!invoice.line_items?.length && invoice.status === "processing")) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={colors.textPrimary} size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Invoice Review</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.processingContent}>
            <ActivityIndicator size="large" color={colors.accentLight} style={{ marginBottom: 16 }} />
            <View style={styles.processingTitleRow}>
              <Sparkles color={colors.accentLight} size={24} />
              <Text style={styles.processingTitle}>AI is working</Text>
            </View>
            <Text style={styles.processingSubtitle}>Generating your itemized invoice...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={colors.textPrimary} size={28} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Invoice Review</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={handleDelete} style={[styles.headerIconBtn, { marginRight: 12, backgroundColor: colors.errorSubtle }]}>
              <Trash2 color={colors.error} size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: "/preview" as any, params: { id } })} style={[styles.headerIconBtn, { marginRight: 12, backgroundColor: colors.surfaceRaised }]}>
              <Eye color={colors.textPrimary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={generatePDF} disabled={isExporting} style={[styles.headerIconBtn, { backgroundColor: colors.surfaceRaised, opacity: isExporting ? 0.7 : 1 }]}>
              {isExporting ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <Share color={colors.textPrimary} size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView style={styles.invoiceScroll} contentContainerStyle={styles.invoiceScrollContent} keyboardShouldPersistTaps="handled">
            {(invoice.prompt || invoice.media_url || invoice.transcript) && (
              <View style={styles.requestContextCard}>
                <TouchableOpacity style={[styles.requestContextHeader, { justifyContent: "space-between" }]} onPress={() => setShowOriginalRequest(!showOriginalRequest)} activeOpacity={0.7}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MessageSquare color={colors.textSecondary} size={16} />
                    <Text style={styles.requestContextTitle}>Original Request</Text>
                  </View>
                  {showOriginalRequest ? <ChevronUp color={colors.textSecondary} size={20} /> : <ChevronDown color={colors.textSecondary} size={20} />}
                </TouchableOpacity>
                {showOriginalRequest && (
                  <View style={{ marginTop: 12 }}>
                    {invoice.prompt && <Text style={styles.promptText}>"{invoice.prompt}"</Text>}
                    {renderMediaPreview()}
                    {invoice.transcript ? (
                      <View style={styles.transcriptSection}>
                        <View style={styles.transcriptHeader}>
                          <Sparkles color={colors.accentLight} size={14} />
                          <Text style={styles.transcriptLabel}>Audio Transcript</Text>
                        </View>
                        <Text style={styles.transcriptText}>{invoice.transcript}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            <View style={{ marginBottom: 16, marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Generated Invoice</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.templateChip} onPress={() => { setCurrencySearch(""); setCurrencyResults([]); setShowCurrencyModal(true); }}>
                  <DollarSign color={colors.textSecondary} size={13} />
                  <Text style={styles.templateChipText}>{invoice?.currency || "USD"}</Text>
                  <ChevronDown color={colors.textSecondary} size={13} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.templateChip} onPress={() => setShowTemplateModal(true)}>
                  <Layout color={colors.textSecondary} size={13} />
                  <Text style={styles.templateChipText}>{INVOICE_TEMPLATES.find((t) => t.id === (invoice?.template || settings?.template))?.name || "Modern"}</Text>
                  <ChevronDown color={colors.textSecondary} size={13} />
                </TouchableOpacity>
              </View>
            </View>

            {invoice.line_items?.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.lineItemCard}
                onPress={() => {
                  setSelectedItem(item);
                  setEditPrice(item.unit_price.toString());
                  setEditQuantity(item.quantity.toString());
                  if (item.discount_percentage) { setEditDiscount(item.discount_percentage.toString()); setDiscountType("percentage"); }
                  else { setEditDiscount(item.discount ? item.discount.toString() : ""); setDiscountType("amount"); }
                  setIsEditing(true);
                }}
                disabled={isProcessingEdit}
              >
                <View style={styles.lineItemContent}>
                  <View style={styles.lineItemHeader}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>{item.quantity}x</Text>
                    </View>
                  </View>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  {item.discount_percentage ? (
                    <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>
                      Discount: {item.discount_percentage}% (-{currencySymbol}{formatAmount(item.discount ?? 0)})
                    </Text>
                  ) : item.discount ? (
                    <Text style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>
                      Discount: -{currencySymbol}{formatAmount(item.discount)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>{currencySymbol}{formatAmount(item.quantity * item.unit_price - (item.discount || 0))}</Text>
                  <Edit2 color={colors.textSecondary} size={16} style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            ))}

            <View style={[styles.totalCard, { backgroundColor: settings?.theme_color || colors.accent, shadowColor: settings?.theme_color || colors.accent }]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrice}>{currencySymbol}{formatAmount(invoice.total)}</Text>
            </View>
          </ScrollView>

          {(isProcessingEdit || isSavingManualEdit) && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.processingOverlay}>
              <View style={styles.processingContent}>
                <ActivityIndicator size="large" color={colors.accentLight} style={{ marginBottom: 16 }} />
                <View style={styles.processingTitleRow}>
                  {isProcessingEdit ? <Sparkles color={colors.accentLight} size={20} /> : <Edit2 color={colors.accentLight} size={20} />}
                  <Text style={styles.processingTitle}>{isProcessingEdit ? "AI is working" : "Saving Changes"}</Text>
                </View>
                <Text style={styles.processingSubtitle}>Updating your invoice...</Text>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.chatContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder={`e.g., Add ${currencySymbol}50 disposal fee`}
            placeholderTextColor={colors.textSecondary}
            value={chatInput}
            onChangeText={setChatInput}
            editable={!isProcessingEdit}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendPrompt} disabled={isProcessingEdit || !chatInput.trim()}>
            {isProcessingEdit ? <ActivityIndicator color="#fff" /> : <Send color={chatInput.trim() ? "#fff" : colors.textSecondary} size={20} />}
          </TouchableOpacity>
        </View>

        {/* Edit Line Item Modal */}
        <Modal visible={isEditing} transparent animationType="slide" onRequestClose={() => setIsEditing(false)}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => setIsEditing(false)}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <RNAnimated.View style={[styles.modalContent, { transform: [{ translateY: panY.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] }]}>
                <View {...panResponder.panHandlers}>
                  <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                  </View>
                  <Text style={styles.modalTitle}>Edit Item</Text>
                  <Text style={styles.modalDesc}>{selectedItem?.description}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput style={styles.modalInput} keyboardType="numeric" value={editQuantity} onChangeText={setEditQuantity} placeholder="e.g. 1" placeholderTextColor={colors.textSecondary} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unit Price ({currencySymbol})</Text>
                  <TextInput style={styles.modalInput} keyboardType="numeric" value={editPrice} onChangeText={setEditPrice} placeholder="e.g. 150.00" placeholderTextColor={colors.textSecondary} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount</Text>
                  <View style={styles.discountTypeToggle}>
                    {(["amount", "percentage"] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.discountTypeBtn, discountType === type && styles.discountTypeBtnActive]}
                        onPress={() => { if (discountType !== type) { setDiscountType(type); setEditDiscount(""); } }}
                      >
                        <Text style={[styles.discountTypeBtnText, discountType === type && styles.discountTypeBtnTextActive]}>
                          {type === "amount" ? `Amount (${currencySymbol})` : "Percentage (%)"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[styles.modalInput, { flexDirection: "row", alignItems: "center", padding: 0 }]}>
                    {discountType === "amount" && <Text style={{ color: colors.textSecondary, fontSize: 16, paddingLeft: 16 }}>{currencySymbol}</Text>}
                    <TextInput
                      style={{ flex: 1, padding: 16, color: colors.textPrimary, fontSize: 16 }}
                      keyboardType="numeric"
                      value={editDiscount}
                      onChangeText={setEditDiscount}
                      placeholder={discountType === "amount" ? "0.00" : "10"}
                      placeholderTextColor={colors.textDisabled}
                    />
                    {discountType === "percentage" && <Text style={{ color: colors.textSecondary, fontSize: 16, paddingRight: 16 }}>%</Text>}
                  </View>
                  {discountType === "percentage" && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                      {[5, 10, 15, 20].map((pct) => (
                        <TouchableOpacity
                          key={pct}
                          style={{ backgroundColor: editDiscount === pct.toString() ? (settings?.theme_color || colors.accent) : colors.surfaceRaised, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: "center" }}
                          onPress={() => setEditDiscount(pct.toString())}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600" }}>{pct}%</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => setIsEditing(false)}>
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: settings?.theme_color || colors.accent }]} onPress={saveManualEdit}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </RNAnimated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Currency Modal */}
        <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => setShowCurrencyModal(false)}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <RNAnimated.View style={[styles.modalContent, { height: "75%", transform: [{ translateY: panYCurrency.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] }]}>
                <View {...panResponderCurrency.panHandlers}>
                  <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
                  <Text style={styles.modalTitle}>Currency</Text>
                </View>
                <View style={styles.currencySearchRow}>
                  <Search color={colors.textSecondary} size={18} />
                  <TextInput style={styles.currencySearchInput} placeholder="Search currency (e.g. USD, Euro)" placeholderTextColor={colors.textSecondary} value={currencySearch} onChangeText={(text) => { setCurrencySearch(text); setCurrencyResults(searchCurrency(text)); }} autoFocus />
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {currencyResults.length > 0 ? (
                    currencyResults.map((curr) => (
                      <TouchableOpacity key={curr.code} style={[styles.currencyItem, invoice?.currency === curr.code && { backgroundColor: colors.accentSubtle }]} onPress={() => saveInvoiceCurrency(curr.code)}>
                        <View>
                          <Text style={styles.currencyCode}>{curr.code}</Text>
                          <Text style={styles.currencyName}>{curr.name}</Text>
                        </View>
                        <Text style={styles.currencySymbolText}>{curr.symbol}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.currencyEmpty}>{currencySearch.trim() ? "No currencies found" : "Type to search currencies…"}</Text>
                  )}
                </ScrollView>
              </RNAnimated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Template Modal */}
        <Modal visible={showTemplateModal} transparent animationType="slide" onRequestClose={() => setShowTemplateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowTemplateModal(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <RNAnimated.View style={[styles.modalContent, { maxHeight: "72%", transform: [{ translateY: panYTemplate.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] }]}>
              <View {...panResponderTemplate.panHandlers}>
                <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
                <Text style={styles.modalTitle}>Choose Template</Text>
              </View>
              <ScrollView contentContainerStyle={styles.templatePickerGrid} showsVerticalScrollIndicator={false}>
                {INVOICE_TEMPLATES.map((tmpl) => {
                  const activeId = invoice?.template || settings?.template || "modern";
                  const isActive = activeId === tmpl.id;
                  return (
                    <TouchableOpacity key={tmpl.id} style={[styles.templatePickerCard, isActive && { borderColor: tmpl.color, backgroundColor: `${tmpl.color}18` }]} onPress={() => saveInvoiceTemplate(tmpl.id)}>
                      <View style={[styles.templatePickerPreviewBox, isActive && { borderColor: tmpl.color, borderWidth: 2 }]}>
                        <InvoiceTemplatePreview type={tmpl.id} color={tmpl.color} />
                        {tmpl.isPremium && (
                          <View style={styles.templatePickerPremiumBadge}>
                            <Text style={styles.templatePickerPremiumText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.templatePickerName, isActive && { color: tmpl.color, fontWeight: "700" }]}>{tmpl.name}</Text>
                      {isActive && (
                        <View style={[styles.templatePickerCheck, { backgroundColor: tmpl.color }]}>
                          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </RNAnimated.View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: c.background,
    borderBottomWidth: 1, borderBottomColor: c.border,
  },
  backBtn: { padding: 4, marginLeft: -8 },
  headerIconBtn: { borderRadius: 18, width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: c.textPrimary },
  proBadge: { backgroundColor: c.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  invoiceScroll: { flex: 1 },
  invoiceScrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: c.textPrimary, fontSize: 18, fontWeight: "bold", marginBottom: 16, marginTop: 8 },
  requestContextCard: { backgroundColor: c.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: c.border },
  requestContextHeader: { flexDirection: "row", alignItems: "center", marginBottom: 0 },
  requestContextTitle: { color: c.textSecondary, fontSize: 14, fontWeight: "600", marginLeft: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  promptText: { color: c.textPrimary, fontSize: 16, lineHeight: 24, fontStyle: "italic", marginBottom: 16 },
  mediaWrapper: { borderRadius: 12, overflow: "hidden", backgroundColor: "#000", height: 200, marginBottom: 16 },
  mediaPreview: { width: "100%", height: "100%" },
  documentPreview: { flexDirection: "row", alignItems: "center", backgroundColor: c.accentSubtle, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.accentBorder, marginBottom: 16, gap: 12 },
  documentText: { color: c.accentLight, fontSize: 16, fontWeight: "600" },
  transcriptSection: { backgroundColor: c.surfaceRaised, padding: 12, borderRadius: 12, marginTop: 4 },
  transcriptHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  transcriptLabel: { color: c.accentLight, fontSize: 12, fontWeight: "600" },
  transcriptText: { color: c.textSecondary, fontSize: 14, lineHeight: 20 },
  lineItemCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: c.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  lineItemContent: { flex: 1, marginRight: 16 },
  lineItemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  qtyBadge: { backgroundColor: c.surfaceRaised, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  qtyText: { color: c.textSecondary, fontSize: 10, fontWeight: "bold" },
  itemDesc: { color: c.textPrimary, fontSize: 16, fontWeight: "500" },
  priceRow: { flexDirection: "row", alignItems: "center" },
  itemPrice: { color: c.textPrimary, fontSize: 18, fontWeight: "bold" },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderRadius: 16, marginTop: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  totalText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  totalPrice: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  chatContainer: { flexDirection: "row", padding: 16, backgroundColor: c.surface, alignItems: "center", borderTopWidth: 1, borderTopColor: c.border },
  chatInput: { flex: 1, backgroundColor: c.surfaceRaised, color: c.textPrimary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  sendButton: { backgroundColor: c.accent, borderRadius: 20, width: 44, height: 44, justifyContent: "center", alignItems: "center", marginLeft: 12 },
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
  modalContent: { backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 40 : 24, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10 },
  dragHandleContainer: { alignItems: "center", paddingBottom: 12 },
  dragHandle: { width: 40, height: 4, backgroundColor: c.borderSubtle, borderRadius: 2 },
  modalTitle: { color: c.textPrimary, fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  modalDesc: { color: c.textSecondary, fontSize: 15, marginBottom: 24, lineHeight: 22 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: c.textPrimary, fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: c.surfaceRaised, color: c.textPrimary, fontSize: 18, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border },
  discountTypeToggle: { flexDirection: "row", marginBottom: 8, backgroundColor: c.background, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: c.border },
  discountTypeBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  discountTypeBtnActive: { backgroundColor: c.surfaceRaised },
  discountTypeBtnText: { color: c.textSecondary, fontWeight: "600" },
  discountTypeBtnTextActive: { color: c.textPrimary },
  modalActions: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceRaised },
  saveBtn: { backgroundColor: c.accent },
  modalBtnText: { color: c.textPrimary, fontSize: 16, fontWeight: "600" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay, justifyContent: "center", alignItems: "center", zIndex: 10 },
  processingContent: { backgroundColor: c.surface, padding: 24, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: c.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  processingTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  processingTitle: { color: c.textPrimary, fontSize: 18, fontWeight: "bold" },
  processingSubtitle: { color: c.textSecondary, fontSize: 14 },
  templateChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: c.border },
  templateChipText: { color: c.textSecondary, fontSize: 12, fontWeight: "600" },
  templatePickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 8 },
  templatePickerCard: { width: "47%", backgroundColor: c.surfaceRaised, borderWidth: 2, borderColor: c.borderSubtle, borderRadius: 12, padding: 10, alignItems: "center", position: "relative" },
  templatePickerPreviewBox: { width: "100%", height: 80, borderRadius: 6, marginBottom: 8, backgroundColor: c.surfaceRaised, overflow: "hidden", borderWidth: 1, borderColor: c.borderSubtle },
  templatePickerName: { color: c.textSecondary, fontSize: 12, fontWeight: "500" },
  templatePickerPremiumBadge: { position: "absolute", top: 4, left: 4, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  templatePickerPremiumText: { color: "#fff", fontSize: 8, fontWeight: "bold" },
  templatePickerCheck: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: c.background },
  currencySearchRow: { flexDirection: "row", alignItems: "center", backgroundColor: c.surfaceRaised, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, height: 46, gap: 10, borderWidth: 1, borderColor: c.border },
  currencySearchInput: { flex: 1, color: c.textPrimary, fontSize: 15 },
  currencyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: c.border, borderRadius: 8, paddingHorizontal: 4 },
  currencyCode: { color: c.textPrimary, fontSize: 15, fontWeight: "600" },
  currencyName: { color: c.textSecondary, fontSize: 13, marginTop: 1 },
  currencySymbolText: { color: c.textSecondary, fontSize: 18, fontWeight: "600" },
  currencyEmpty: { color: c.textSecondary, textAlign: "center", marginTop: 40, fontSize: 15 },
});
