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
import * as Print from "expo-print";
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
import { getCurrencySymbol, searchCurrency, Currency } from "../../utils/currency";
import { Video, ResizeMode } from "expo-av";

const INVOICE_TEMPLATES = [
  { id: "premium", name: "Premium", color: "#7C3AED", isPremium: true },
  { id: "elegant", name: "Elegant", color: "#D4AF37", isPremium: true },
  { id: "bold", name: "Bold", color: "#FF3366", isPremium: true },
  { id: "modern", name: "Modern", color: "#4F46E5" },
  { id: "classic", name: "Classic", color: "#10B981" },
  { id: "minimal", name: "Minimalist", color: "#F59E0B" },
];

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
        <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" }}>
          <View style={{ flex: 1, paddingRight: 6 }}>
            <View style={{ height: 2, width: "70%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: "55%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 0.5, backgroundColor: "#e5e7eb" }} />
          <View style={{ flex: 1, paddingLeft: 6 }}>
            <View style={{ height: 2, width: "65%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: "50%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
        </View>
        <View style={{ borderLeftWidth: 3.5, borderLeftColor: color, backgroundColor: color + "15", paddingHorizontal: 6, paddingVertical: 3.5, marginBottom: 3 }}>
          <View style={{ height: 1.5, width: "55%", backgroundColor: color, opacity: 0.7, borderRadius: 0.5 }} />
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
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, fontWeight: "700", color: color }}>INVOICE</Text>
            <View style={{ height: 1.5, width: 24, backgroundColor: "#ccc", borderRadius: 0.5, marginTop: 2 }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 6, paddingTop: 5, paddingBottom: 4, gap: 4 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 5, padding: 4 }}>
              <View style={{ height: 1.5, width: "65%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5, marginBottom: 2.5 }} />
              <View style={{ height: 1.5, width: "85%", backgroundColor: "#ccc", borderRadius: 0.5, marginBottom: 1.5 }} />
              <View style={{ height: 1.5, width: "60%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal: 8 }}>
          {[60, 46, 53].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, borderTopWidth: i === 0 ? 0 : 0.5, borderTopColor: "#e2e8f0" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "20%", backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 8, paddingTop: 4 }}>
          <View style={{ backgroundColor: color, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2.5 }}>
            <Text style={{ fontSize: 5, color: "#fff", fontWeight: "700" }}>$8,250</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === "classic") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ height: 4, backgroundColor: color }} />
        <View style={{ flexDirection: "row", alignItems: "flex-start", padding: 6, gap: 5, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
          <View style={{ width: 20, height: 20, backgroundColor: color, borderRadius: 2, justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
            <Text style={{ fontSize: 8, color: "#fff", fontWeight: "700" }}>A</Text>
          </View>
          <View style={{ borderLeftWidth: 3, borderLeftColor: color, paddingLeft: 5, flex: 1 }}>
            <View style={{ height: 2.5, width: "70%", backgroundColor: "#111", borderRadius: 0.5, marginBottom: 1.5 }} />
            <View style={{ height: 1.5, width: "50%", backgroundColor: "#aaa", borderRadius: 0.5 }} />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ height: 2, width: 22, backgroundColor: color, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: 18, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 3, backgroundColor: color + "22" }}>
          <View style={{ flex: 2, height: 1.5, backgroundColor: color, borderRadius: 0.5, marginRight: 4 }} />
          <View style={{ flex: 1, height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
          <View style={{ flex: 1, height: 1.5, backgroundColor: color, borderRadius: 0.5, marginLeft: 4 }} />
        </View>
        {[1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
            <View style={{ flex: 2, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginRight: 4 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginLeft: 4 }} />
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 6, paddingTop: 4, gap: 4 }}>
          <Text style={{ fontSize: 5, color: "#777" }}>Total</Text>
          <Text style={{ fontSize: 5, fontWeight: "800", color: "#111" }}>$8,250</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ height: 2, backgroundColor: color }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 8, paddingTop: 8, paddingBottom: 5 }}>
        <View>
          <View style={{ height: 2.5, width: 36, backgroundColor: "#111", borderRadius: 0.5, marginBottom: 2 }} />
          <View style={{ height: 1.5, width: 26, backgroundColor: "#aaa", borderRadius: 0.5, marginBottom: 1.5 }} />
          <View style={{ height: 1.5, width: 30, backgroundColor: "#ccc", borderRadius: 0.5 }} />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 5.5, fontWeight: "500", color: "#999", letterSpacing: 2.5 }}>INVOICE</Text>
          <View style={{ height: 1.5, width: 22, backgroundColor: "#ccc", borderRadius: 0.5, marginTop: 2 }} />
        </View>
      </View>
      <View style={{ height: 0.5, backgroundColor: "#ddd", marginHorizontal: 8, marginBottom: 5 }} />
      {[54, 42, 48].map((w, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 3.5 }}>
          <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "18%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
        </View>
      ))}
      <View style={{ height: 0.5, backgroundColor: "#ddd", marginHorizontal: 8, marginBottom: 4 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 5, color: "#999", fontWeight: "600", letterSpacing: 1.5 }}>TOTAL</Text>
        <Text style={{ fontSize: 5, color: "#111", fontWeight: "700" }}>$8,250</Text>
      </View>
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
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LineItem | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    "amount",
  );
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

  const makePanResponder = (
    animValue: RNAnimated.Value,
    onDismiss: () => void,
  ) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: RNAnimated.event([null, { dy: animValue }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 1.5) {
          onDismiss();
        } else {
          RNAnimated.spring(animValue, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    });

  const panResponder = useRef(
    makePanResponder(panY, () => setIsEditing(false)),
  ).current;
  const panResponderCurrency = useRef(
    makePanResponder(panYCurrency, () => setShowCurrencyModal(false)),
  ).current;
  const panResponderTemplate = useRef(
    makePanResponder(panYTemplate, () => setShowTemplateModal(false)),
  ).current;

  useEffect(() => {
    if (!user || !id) return;
    const docRef = doc(db, "invoices", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setInvoice(docSnap.data() as InvoiceData);
      }
    });

    const settingsRef = doc(db, "users", user.uid, "settings", "invoice");
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSettings();
    };
  }, [id, user]);

  const handleSendPrompt = async () => {
    if (!chatInput.trim() || !user) return;
    setIsProcessingEdit(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(CONFIG.api.endpoints.editQuote, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoice_id: id, prompt: chatInput }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to edit quote");
      }
      setChatInput("");
    } catch (e) {
      console.error(e);
      alert("Failed to send edit prompt.");
    } finally {
      setIsProcessingEdit(false);
    }
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
        if (discountType === "percentage") {
          newDiscountPercentage = parsedDiscount;
          newDiscount = newPrice * newQuantity * (parsedDiscount / 100);
        } else {
          newDiscount = parsedDiscount;
        }
      }

      if (isNaN(newPrice) || isNaN(newQuantity) || isNaN(newDiscount)) {
        throw new Error("Invalid input values");
      }

      // 1. Update the specific line item
      const updatedLineItems = (invoice.line_items || []).map((item) => {
        if (item.id === selectedItem.id) {
          const { discount, discount_percentage, ...rest } = item;
          const updatedItem: any = {
            ...rest,
            unit_price: newPrice,
            quantity: newQuantity,
          };
          if (newDiscount > 0) {
            updatedItem.discount = newDiscount;
          }
          if (newDiscountPercentage !== undefined) {
            updatedItem.discount_percentage = newDiscountPercentage;
          }
          return updatedItem;
        }
        return item;
      });

      // 2. Recalculate subtotal
      const newSubtotal = updatedLineItems.reduce((sum, item) => {
        const itemTotal =
          item.quantity * item.unit_price - (item.discount || 0);
        return sum + itemTotal;
      }, 0);

      // 3. Recalculate total (assuming total = subtotal + taxes)
      // Note: If taxes are a percentage, this logic might need adjustment.
      // But currently taxes seem to be a flat amount in the invoice data.
      const currentTaxes = invoice.taxes || 0;
      const newTotal = newSubtotal + currentTaxes;

      // 4. Update Firestore directly
      await setDoc(
        doc(db, "invoices", id),
        {
          line_items: updatedLineItems,
          subtotal: Number(newSubtotal.toFixed(2)),
          total: Number(newTotal.toFixed(2)),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("Failed to save manual edit:", e);
      Alert.alert("Error", "Failed to save edit.");
    } finally {
      setIsSavingManualEdit(false);
    }
  };

  const currencySymbol = getCurrencySymbol(invoice?.currency);

  const generatePDF = async () => {
    if (!invoice || !user || !id || isExporting) return;
    setIsExporting(true);

    try {
      // 1. Get user settings, applying invoice-level template override if set
      let customization = { ...(settings || {}) };
      if (invoice.template) {
        customization.template = invoice.template;
      }

      // 2. Fetch preview HTML from backend
      const token = await user.getIdToken();
      const res = await fetch(CONFIG.api.endpoints.previewQuote(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customization),
      });

      if (!res.ok) {
        throw new Error("Failed to load invoice preview for export");
      }

      const html = await res.text();

      // 3. Generate PDF and share
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (e: any) {
      console.error("Error generating PDF:", e);
      Alert.alert(
        "Export Error",
        e.message || "Something went wrong while exporting.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const saveInvoiceCurrency = async (code: string) => {
    if (!user || !id) return;
    try {
      await setDoc(doc(db, "invoices", id), { currency: code }, { merge: true });
    } catch (e) {
      console.error("Failed to save currency:", e);
    }
    setShowCurrencyModal(false);
  };

  const saveInvoiceTemplate = async (templateId: string) => {
    if (!user || !id) return;
    try {
      await setDoc(doc(db, "invoices", id), { template: templateId }, { merge: true });
    } catch (e) {
      console.error("Failed to save template:", e);
    }
    setShowTemplateModal(false);
  };

  const handleDelete = () => {
    if (!invoice || !id) return;
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
              // Delete associated media from Storage if it's hosted on Firebase
              if (
                invoice.media_url &&
                invoice.media_url.includes("firebasestorage")
              ) {
                try {
                  const mediaRef = ref(storage, invoice.media_url);
                  await deleteObject(mediaRef);
                  console.log("Deleted associated media:", invoice.media_url);
                } catch (mediaErr) {
                  console.error(
                    "Failed to delete media from storage:",
                    mediaErr,
                  );
                }
              }
              // Delete the document from Firestore
              await deleteDoc(doc(db, "invoices", id));
              Alert.alert("Deleted", "Invoice deleted successfully.");
              router.replace("/(tabs)/two");
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

  const renderMediaPreview = () => {
    if (!invoice?.media_url) return null;
    const url = invoice.media_url.toLowerCase();
    const isVideo = url.includes(".mov") || url.includes(".mp4");
    const isImage =
      url.includes(".jpg") || url.includes(".jpeg") || url.includes(".png");

    if (isVideo) {
      return (
        <View style={styles.mediaWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: invoice.media_url }}
            style={styles.mediaPreview}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping={false}
          />
        </View>
      );
    }

    if (isImage) {
      return (
        <View style={styles.mediaWrapper}>
          <Image
            source={{ uri: invoice.media_url }}
            style={styles.mediaPreview}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.documentPreview}
        onPress={() => Linking.openURL(invoice.media_url!)}
      >
        <FileText color="#818CF8" size={32} />
        <Text style={styles.documentText}>View Attached Document</Text>
      </TouchableOpacity>
    );
  };

  if (
    !invoice ||
    (!invoice.line_items?.length && invoice.status === "processing")
  ) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Invoice Review</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.processingContent}
          >
            <ActivityIndicator
              size="large"
              color="#818CF8"
              style={{ marginBottom: 16 }}
            />
            <View style={styles.processingTitleRow}>
              <Sparkles color="#818CF8" size={24} />
              <Text style={styles.processingTitle}>AI is working</Text>
            </View>
            <Text style={styles.processingSubtitle}>
              Generating your itemized invoice...
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft color="#fff" size={28} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Invoice Review</Text>
            <View
              style={[
                styles.proBadge,
                { backgroundColor: settings?.theme_color || "#4F46E5" },
              ]}
            >
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[
                styles.shareButton,
                {
                  marginRight: 12,
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  borderRadius: 18,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Trash2 color="#EF4444" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/preview" as any, params: { id } })
              }
              style={[
                styles.shareButton,
                {
                  marginRight: 12,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Eye color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={generatePDF}
              disabled={isExporting}
              style={[
                styles.shareButton,
                {
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isExporting ? 0.7 : 1,
                },
              ]}
            >
              {isExporting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Share color="#fff" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.invoiceScroll}
            contentContainerStyle={styles.invoiceScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Request Context Card */}
            {(invoice.prompt || invoice.media_url || invoice.transcript) && (
              <View style={styles.requestContextCard}>
                <TouchableOpacity
                  style={[
                    styles.requestContextHeader,
                    { justifyContent: "space-between" },
                  ]}
                  onPress={() => setShowOriginalRequest(!showOriginalRequest)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MessageSquare color="#A1A1AA" size={16} />
                    <Text style={styles.requestContextTitle}>
                      Original Request
                    </Text>
                  </View>
                  {showOriginalRequest ? (
                    <ChevronUp color="#A1A1AA" size={20} />
                  ) : (
                    <ChevronDown color="#A1A1AA" size={20} />
                  )}
                </TouchableOpacity>

                {showOriginalRequest && (
                  <View style={{ marginTop: 12 }}>
                    {invoice.prompt && (
                      <Text style={styles.promptText}>"{invoice.prompt}"</Text>
                    )}

                    {renderMediaPreview()}

                    {invoice.transcript ? (
                      <View style={styles.transcriptSection}>
                        <View style={styles.transcriptHeader}>
                          <Sparkles color="#818CF8" size={14} />
                          <Text style={styles.transcriptLabel}>
                            Audio Transcript
                          </Text>
                        </View>
                        <Text style={styles.transcriptText}>
                          {invoice.transcript}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            {/* Line Items */}
            <View style={{ marginBottom: 16, marginTop: 8 }}>
              <Text style={styles.sectionTitle}>Generated Invoice</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={styles.templateChip}
                  onPress={() => {
                    setCurrencySearch("");
                    setCurrencyResults([]);
                    setShowCurrencyModal(true);
                  }}
                >
                  <DollarSign color="#A1A1AA" size={13} />
                  <Text style={styles.templateChipText}>{invoice?.currency || "USD"}</Text>
                  <ChevronDown color="#A1A1AA" size={13} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.templateChip}
                  onPress={() => setShowTemplateModal(true)}
                >
                  <Layout color="#A1A1AA" size={13} />
                  <Text style={styles.templateChipText}>
                    {INVOICE_TEMPLATES.find(
                      (t) => t.id === (invoice?.template || settings?.template),
                    )?.name || "Modern"}
                  </Text>
                  <ChevronDown color="#A1A1AA" size={13} />
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
                  if (item.discount_percentage) {
                    setEditDiscount(item.discount_percentage.toString());
                    setDiscountType("percentage");
                  } else {
                    setEditDiscount(
                      item.discount ? item.discount.toString() : "",
                    );
                    setDiscountType("amount");
                  }
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
                    <Text
                      style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}
                    >
                      Discount: {item.discount_percentage}% (-{currencySymbol}
                      {item.discount?.toFixed(2) || "0.00"})
                    </Text>
                  ) : item.discount ? (
                    <Text
                      style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}
                    >
                      Discount: -{currencySymbol}
                      {item.discount.toFixed(2)}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>
                    {currencySymbol}
                    {(
                      item.quantity * item.unit_price -
                      (item.discount || 0)
                    ).toFixed(2)}
                  </Text>
                  <Edit2 color="#888" size={16} style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            ))}

            <View
              style={[
                styles.totalCard,
                {
                  backgroundColor: settings?.theme_color || "#4F46E5",
                  shadowColor: settings?.theme_color || "#4F46E5",
                },
              ]}
            >
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrice}>
                {currencySymbol}
                {invoice.total}
              </Text>
            </View>
          </ScrollView>

          {isProcessingEdit && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={styles.processingOverlay}
            >
              <View style={styles.processingContent}>
                <ActivityIndicator
                  size="large"
                  color="#818CF8"
                  style={{ marginBottom: 16 }}
                />
                <View style={styles.processingTitleRow}>
                  <Sparkles color="#818CF8" size={20} />
                  <Text style={styles.processingTitle}>AI is working</Text>
                </View>
                <Text style={styles.processingSubtitle}>
                  Updating your invoice...
                </Text>
              </View>
            </Animated.View>
          )}

          {isSavingManualEdit && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={styles.processingOverlay}
            >
              <View style={styles.processingContent}>
                <ActivityIndicator
                  size="large"
                  color="#818CF8"
                  style={{ marginBottom: 16 }}
                />
                <View style={styles.processingTitleRow}>
                  <Edit2 color="#818CF8" size={20} />
                  <Text style={styles.processingTitle}>Saving Changes</Text>
                </View>
                <Text style={styles.processingSubtitle}>
                  Updating your invoice...
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.chatContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder={`e.g., Add ${currencySymbol}50 disposal fee`}
            placeholderTextColor="#888"
            value={chatInput}
            onChangeText={setChatInput}
            editable={!isProcessingEdit}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: settings?.theme_color || "#4F46E5" },
            ]}
            onPress={handleSendPrompt}
            disabled={isProcessingEdit || !chatInput.trim()}
          >
            {isProcessingEdit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send color={chatInput.trim() ? "#fff" : "#A1A1AA"} size={20} />
            )}
          </TouchableOpacity>
        </View>

        <Modal
          visible={isEditing}
          transparent
          animationType="slide"
          onRequestClose={() => setIsEditing(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => setIsEditing(false)}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <RNAnimated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      {
                        translateY: panY.interpolate({
                          inputRange: [0, 1000],
                          outputRange: [0, 1000],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View {...panResponder.panHandlers}>
                  <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                  </View>
                  <Text style={styles.modalTitle}>Edit Item</Text>
                  <Text style={styles.modalDesc}>
                    {selectedItem?.description}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    placeholder="e.g. 1"
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Unit Price ({currencySymbol})
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={editPrice}
                    onChangeText={setEditPrice}
                    placeholder="e.g. 150.00"
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Discount</Text>

                  {/* Type Toggle */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginBottom: 8,
                      backgroundColor: "#1e1e1e",
                      borderRadius: 8,
                      padding: 4,
                      borderWidth: 1,
                      borderColor: "#2c2c2c",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: "center",
                        backgroundColor:
                          discountType === "amount" ? "#2c2c2c" : "transparent",
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        if (discountType !== "amount") {
                          setDiscountType("amount");
                          setEditDiscount("");
                        }
                      }}
                    >
                      <Text
                        style={{
                          color: discountType === "amount" ? "#fff" : "#888",
                          fontWeight: "600",
                        }}
                      >
                        Amount ({currencySymbol})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: "center",
                        backgroundColor:
                          discountType === "percentage"
                            ? "#2c2c2c"
                            : "transparent",
                        borderRadius: 6,
                      }}
                      onPress={() => {
                        if (discountType !== "percentage") {
                          setDiscountType("percentage");
                          setEditDiscount("");
                        }
                      }}
                    >
                      <Text
                        style={{
                          color:
                            discountType === "percentage" ? "#fff" : "#888",
                          fontWeight: "600",
                        }}
                      >
                        Percentage (%)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.modalInput,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 0,
                      },
                    ]}
                  >
                    {discountType === "amount" && (
                      <Text
                        style={{ color: "#888", fontSize: 16, paddingLeft: 16 }}
                      >
                        {currencySymbol}
                      </Text>
                    )}
                    <TextInput
                      style={{
                        flex: 1,
                        padding: 16,
                        color: "#fff",
                        fontSize: 16,
                      }}
                      keyboardType="numeric"
                      value={editDiscount}
                      onChangeText={setEditDiscount}
                      placeholder={discountType === "amount" ? "0.00" : "10"}
                      placeholderTextColor="#555"
                    />
                    {discountType === "percentage" && (
                      <Text
                        style={{
                          color: "#888",
                          fontSize: 16,
                          paddingRight: 16,
                        }}
                      >
                        %
                      </Text>
                    )}
                  </View>

                  {/* Quick percentage buttons */}
                  {discountType === "percentage" && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 12,
                      }}
                    >
                      {[5, 10, 15, 20].map((pct) => (
                        <TouchableOpacity
                          key={pct}
                          style={{
                            backgroundColor:
                              editDiscount === pct.toString()
                                ? settings?.theme_color || "#4F46E5"
                                : "#2c2c2c",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            flex: 1,
                            marginHorizontal: 4,
                            alignItems: "center",
                          }}
                          onPress={() => setEditDiscount(pct.toString())}
                        >
                          <Text style={{ color: "#fff", fontWeight: "600" }}>
                            {pct}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.saveBtn,
                      { backgroundColor: settings?.theme_color || "#4F46E5" },
                    ]}
                    onPress={saveManualEdit}
                  >
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </RNAnimated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Currency Picker Modal */}
        <Modal
          visible={showCurrencyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => setShowCurrencyModal(false)}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <RNAnimated.View
                style={[
                  styles.modalContent,
                  { height: "75%", transform: [{ translateY: panYCurrency.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] },
                ]}
              >
                <View {...panResponderCurrency.panHandlers}>
                  <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                  </View>
                  <Text style={styles.modalTitle}>Currency</Text>
                </View>

                {/* Search */}
                <View style={styles.currencySearchRow}>
                  <Search color="#A1A1AA" size={18} />
                  <TextInput
                    style={styles.currencySearchInput}
                    placeholder="Search currency (e.g. USD, Euro)"
                    placeholderTextColor="#A1A1AA"
                    value={currencySearch}
                    onChangeText={(text) => {
                      setCurrencySearch(text);
                      setCurrencyResults(searchCurrency(text));
                    }}
                    autoFocus
                  />
                </View>

                <ScrollView keyboardShouldPersistTaps="handled">
                  {currencyResults.length > 0 ? (
                    currencyResults.map((curr) => (
                      <TouchableOpacity
                        key={curr.code}
                        style={[
                          styles.currencyItem,
                          invoice?.currency === curr.code && {
                            backgroundColor: "rgba(79,70,229,0.08)",
                          },
                        ]}
                        onPress={() => saveInvoiceCurrency(curr.code)}
                      >
                        <View>
                          <Text style={styles.currencyCode}>{curr.code}</Text>
                          <Text style={styles.currencyName}>{curr.name}</Text>
                        </View>
                        <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.currencyEmpty}>
                      {currencySearch.trim() ? "No currencies found" : "Type to search currencies…"}
                    </Text>
                  )}
                </ScrollView>
              </RNAnimated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Template Picker Modal */}
        <Modal
          visible={showTemplateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTemplateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowTemplateModal(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <RNAnimated.View
              style={[
                styles.modalContent,
                { maxHeight: "72%", transform: [{ translateY: panYTemplate.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] },
              ]}
            >
              <View {...panResponderTemplate.panHandlers}>
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
                <Text style={styles.modalTitle}>Choose Template</Text>
              </View>
              <ScrollView
                contentContainerStyle={styles.templatePickerGrid}
                showsVerticalScrollIndicator={false}
              >
                {INVOICE_TEMPLATES.map((tmpl) => {
                  const activeId = invoice?.template || settings?.template || "modern";
                  const isActive = activeId === tmpl.id;
                  return (
                    <TouchableOpacity
                      key={tmpl.id}
                      style={[
                        styles.templatePickerCard,
                        isActive && {
                          borderColor: tmpl.color,
                          backgroundColor: `${tmpl.color}18`,
                        },
                      ]}
                      onPress={() => saveInvoiceTemplate(tmpl.id)}
                    >
                      <View
                        style={[
                          styles.templatePickerPreviewBox,
                          isActive && { borderColor: tmpl.color, borderWidth: 2 },
                        ]}
                      >
                        <InvoiceTemplatePreview type={tmpl.id} color={tmpl.color} />
                        {tmpl.isPremium && (
                          <View style={styles.templatePickerPremiumBadge}>
                            <Text style={styles.templatePickerPremiumText}>PRO</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.templatePickerName,
                          isActive && { color: tmpl.color, fontWeight: "700" },
                        ]}
                      >
                        {tmpl.name}
                      </Text>
                      {isActive && (
                        <View
                          style={[
                            styles.templatePickerCheck,
                            { backgroundColor: tmpl.color },
                          ]}
                        >
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2c2c2c",
  },
  backBtn: {
    padding: 4,
    marginLeft: -8,
  },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  proBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  proBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  shareButton: { padding: 4 },
  invoiceScroll: { flex: 1 },
  invoiceScrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  requestContextCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  requestContextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  requestContextTitle: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  promptText: {
    color: "#E4E4E7",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 16,
  },
  mediaWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    height: 200,
    marginBottom: 16,
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.3)",
    marginBottom: 16,
    gap: 12,
  },
  documentText: {
    color: "#818CF8",
    fontSize: 16,
    fontWeight: "600",
  },
  transcriptSection: {
    backgroundColor: "#2c2c2c",
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  transcriptLabel: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "600",
  },
  transcriptText: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 20,
  },
  lineItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  lineItemContent: { flex: 1, marginRight: 16 },
  lineItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  qtyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qtyText: { color: "#ccc", fontSize: 10, fontWeight: "bold" },
  itemDesc: { color: "#E4E4E7", fontSize: 16, fontWeight: "500" },
  priceRow: { flexDirection: "row", alignItems: "center" },
  itemPrice: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  totalText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  totalPrice: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  chatContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2c2c2c",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#2c2c2c",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#3f3f46",
    borderRadius: 2,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalDesc: {
    color: "#A1A1AA",
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#E4E4E7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: "#2c2c2c",
    color: "#fff",
    fontSize: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c2c2c",
  },
  saveBtn: { backgroundColor: "#4F46E5" },
  modalBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18, 18, 18, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  processingContent: {
    backgroundColor: "#1e1e1e",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2c2c2c",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  processingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  processingTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  processingSubtitle: {
    color: "#888",
    fontSize: 14,
  },
  invoiceSectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  templateChipText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
  },
  templatePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 8,
  },
  templatePickerCard: {
    width: "47%",
    backgroundColor: "#2c2c2c",
    borderWidth: 2,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    position: "relative",
  },
  templatePickerPreviewBox: {
    width: "100%",
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#27272A",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  templatePickerName: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "500",
  },
  templatePickerPremiumBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templatePickerPremiumText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  templatePickerCheck: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  currencySearchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 46,
    gap: 10,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  currencySearchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2c2c2c",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  currencyCode: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  currencyName: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 1,
  },
  currencySymbol: {
    color: "#A1A1AA",
    fontSize: 18,
    fontWeight: "600",
  },
  currencyEmpty: {
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});
