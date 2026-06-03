import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  PanResponder,
  Animated as RNAnimated,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import SignatureScreen from "react-native-signature-canvas";
import {
  Check,
  Building2,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Crown,
  PenTool,
  DollarSign,
  Search,
  X,
  Eye,
  FileText,
} from "lucide-react-native";
import { WebView } from "react-native-webview";
import { CONFIG } from "../config";
import { searchCurrency, Currency } from "../utils/currency";

const TEMPLATES = [
  { id: "premium", name: "Premium", color: "#7C3AED", isPremium: true },
  { id: "elegant", name: "Elegant", color: "#D4AF37", isPremium: true },
  { id: "bold", name: "Bold", color: "#FF3366", isPremium: true },
  { id: "modern", name: "Modern", color: "#4F46E5" },
  { id: "classic", name: "Classic", color: "#10B981" },
  { id: "minimal", name: "Minimalist", color: "#F59E0B" },
];

const PRESET_COLORS = [
  "#4F46E5", // Indigo (Default)
  "#2563EB", // Blue
  "#0EA5E9", // Light Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#000000", // Black
];

const TemplatePreview = ({ type, color }: { type: string; color: string }) => {
  const dark = "#1a1a2e";

  if (type === "premium") {
    // Dark navy header: accent company name left, italic white INVOICE right
    // Accent gradient separator, two-col meta, dark table header, item rows, dark total button
    return (
      <View style={[styles.previewContainer, { backgroundColor: "#fafafa" }]}>
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 3, width: 32, backgroundColor: color, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: 22, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
          </View>
          <Text style={{ fontSize: 7, color: "#fff", fontStyle: "italic", fontWeight: "700", letterSpacing: 1 }}>Invoice</Text>
        </View>
        {/* Gradient separator */}
        <View style={{ height: 1, backgroundColor: color, opacity: 0.8 }} />
        {/* Two-col meta */}
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
        {/* Dark table header */}
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3.5, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ height: 1.5, width: "50%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "20%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
        </View>
        {/* Item rows */}
        {[55, 42].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 7, paddingVertical: 3.5, borderBottomWidth: 0.5, borderBottomColor: "#eee" }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
        ))}
        {/* Dark total button */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 7, paddingTop: 5 }}>
          <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 2 }}>
            <Text style={{ fontSize: 5, color: color, fontWeight: "700" }}>TOTAL  $8,250</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === "elegant") {
    // Centered masthead: accent circle monogram, company name, double gold rules
    // Italic "Invoice" left / date right, accent-underlined table headers
    const gold = "#c9a84c";
    return (
      <View style={[styles.previewContainer, { backgroundColor: "#fff" }]}>
        {/* Centered masthead */}
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 6 }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, justifyContent: "center", alignItems: "center", marginBottom: 3 }}>
            <Text style={{ fontSize: 8, color: "#fff", fontWeight: "700" }}>A</Text>
          </View>
          <View style={{ height: 2.5, width: 46, backgroundColor: color, borderRadius: 0.5, marginBottom: 1.5 }} />
          <View style={{ height: 1.5, width: 34, backgroundColor: "#bbb", borderRadius: 0.5, marginBottom: 5 }} />
          {/* Double gold decorative rules */}
          <View style={{ width: "80%", height: 1.5, backgroundColor: gold, marginBottom: 1.5 }} />
          <View style={{ width: "80%", height: 0.75, backgroundColor: gold, opacity: 0.5 }} />
        </View>
        {/* Invoice meta */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 7.5, fontStyle: "italic", color: color, fontWeight: "700" }}>Invoice</Text>
          <View style={{ height: 1.5, width: "30%", backgroundColor: "#ccc", borderRadius: 0.5, marginTop: 2 }} />
        </View>
        {/* Table: accent-underlined header then rows */}
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
    // Full-width accent banner + dark identity bar + party row + project band + rows
    const boldDark = "#1f2937";
    return (
      <View style={[styles.previewContainer, { backgroundColor: "#fff" }]}>
        {/* Large accent banner */}
        <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 4.5, width: 44, backgroundColor: "#fff", borderRadius: 0.5, marginBottom: 2.5 }} />
            <View style={{ height: 1.5, width: 28, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.22)" }} />
        </View>
        {/* Dark identity bar with ghost INVOICE text */}
        <View style={{ backgroundColor: boldDark, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.1)", letterSpacing: 3 }}>INV</Text>
          <View style={{ height: 1.5, width: "38%", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
        </View>
        {/* Two-column party row */}
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
        {/* Accent-light project band with left border */}
        <View style={{ borderLeftWidth: 3.5, borderLeftColor: color, backgroundColor: color + "15", paddingHorizontal: 6, paddingVertical: 3.5, marginBottom: 3 }}>
          <View style={{ height: 1.5, width: "55%", backgroundColor: color, opacity: 0.7, borderRadius: 0.5 }} />
        </View>
        {/* Item rows */}
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
    // Rounded page, accent square avatar + company left / large accent INVOICE right
    // Two rounded info cards, item rows, accent total badge
    return (
      <View style={[styles.previewContainer, { backgroundColor: "#fff", borderRadius: 6, overflow: "hidden" }]}>
        {/* Header */}
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
        {/* Two rounded info cards */}
        <View style={{ flexDirection: "row", paddingHorizontal: 6, paddingTop: 5, paddingBottom: 4, gap: 4 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 5, padding: 4 }}>
              <View style={{ height: 1.5, width: "65%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5, marginBottom: 2.5 }} />
              <View style={{ height: 1.5, width: "85%", backgroundColor: "#ccc", borderRadius: 0.5, marginBottom: 1.5 }} />
              <View style={{ height: 1.5, width: "60%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        {/* Item rows */}
        <View style={{ paddingHorizontal: 8 }}>
          {[60, 46, 53].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, borderTopWidth: i === 0 ? 0 : 0.5, borderTopColor: "#e2e8f0" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "20%", backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        {/* Accent total badge */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 8, paddingTop: 4 }}>
          <View style={{ backgroundColor: color, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2.5 }}>
            <Text style={{ fontSize: 5, color: "#fff", fontWeight: "700" }}>$8,250</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === "classic") {
    // 4px accent top rule, square monogram + left-border company block, bordered table
    return (
      <View style={[styles.previewContainer, { backgroundColor: "#fff" }]}>
        {/* 4px accent top rule */}
        <View style={{ height: 4, backgroundColor: color }} />
        {/* Letterhead */}
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
        {/* Table header with accent tint */}
        <View style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 3, backgroundColor: color + "22" }}>
          <View style={{ flex: 2, height: 1.5, backgroundColor: color, borderRadius: 0.5, marginRight: 4 }} />
          <View style={{ flex: 1, height: 1.5, backgroundColor: color, borderRadius: 0.5 }} />
          <View style={{ flex: 1, height: 1.5, backgroundColor: color, borderRadius: 0.5, marginLeft: 4 }} />
        </View>
        {/* Item rows with borders */}
        {[1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
            <View style={{ flex: 2, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginRight: 4 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginLeft: 4 }} />
          </View>
        ))}
        {/* Total */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 6, paddingTop: 4, gap: 4 }}>
          <Text style={{ fontSize: 5, color: "#777" }}>Total</Text>
          <Text style={{ fontSize: 5, fontWeight: "800", color: "#111" }}>$8,250</Text>
        </View>
      </View>
    );
  }

  // MINIMAL — 2px accent top rule, sparse layout, spaced INVOICE label, bare dividers
  return (
    <View style={[styles.previewContainer, { backgroundColor: "#fff" }]}>
      {/* 2px accent top rule */}
      <View style={{ height: 2, backgroundColor: color }} />
      {/* Header */}
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
      {/* Thin divider */}
      <View style={{ height: 0.5, backgroundColor: "#ddd", marginHorizontal: 8, marginBottom: 5 }} />
      {/* Item rows — no borders, ultra clean */}
      {[54, 42, 48].map((w, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 3.5 }}>
          <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "18%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
        </View>
      ))}
      {/* Bottom divider + total */}
      <View style={{ height: 0.5, backgroundColor: "#ddd", marginHorizontal: 8, marginBottom: 4 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 5, color: "#999", fontWeight: "600", letterSpacing: 1.5 }}>TOTAL</Text>
        <Text style={{ fontSize: 5, color: "#111", fontWeight: "700" }}>$8,250</Text>
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialState, setInitialState] = useState({
    template: TEMPLATES[0].id,
    companyName: "",
    address: "",
    phone: "",
    email: user?.email || "",
    companyLogo: "",
    signatureUrl: "",
    currency: "USD",
    themeColor: PRESET_COLORS[0],
    priceListUrl: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialState.template,
  );
  const [companyName, setCompanyName] = useState(initialState.companyName);
  const [address, setAddress] = useState(initialState.address);
  const [phone, setPhone] = useState(initialState.phone);
  const [email, setEmail] = useState(initialState.email);
  const [companyLogo, setCompanyLogo] = useState(initialState.companyLogo);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(initialState.signatureUrl);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [currency, setCurrency] = useState(initialState.currency);
  const [themeColor, setThemeColor] = useState(initialState.themeColor);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");
  const [currencySearchResults, setCurrencySearchResults] = useState<
    Currency[]
  >([]);

  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [priceListUrl, setPriceListUrl] = useState("");
  const [priceListName, setPriceListName] = useState("");

  const panY = useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    if (showCurrencyModal) {
      panY.setValue(0);
    }
  }, [showCurrencyModal]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: RNAnimated.event([null, { dy: panY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 1.5) {
          setShowCurrencyModal(false);
        } else {
          RNAnimated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const signatureRef = useRef<any>(null);

  const hasChanges =
    selectedTemplate !== initialState.template ||
    companyName !== initialState.companyName ||
    address !== initialState.address ||
    phone !== initialState.phone ||
    email !== initialState.email ||
    companyLogo !== initialState.companyLogo ||
    signatureUrl !== initialState.signatureUrl ||
    currency !== initialState.currency ||
    themeColor !== initialState.themeColor ||
    priceListUrl !== initialState.priceListUrl;

  React.useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      try {
        const customizationRef = doc(
          db,
          "users",
          user.uid,
          "settings",
          "invoice",
        );
        const docSnap = await getDoc(customizationRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedState = {
            template: data.template || TEMPLATES[0].id,
            companyName: data.companyName || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || user?.email || "",
            companyLogo: data.company_logo || "",
            signatureUrl: data.signature_url || "",
            currency: data.currency || "USD",
            themeColor: data.theme_color || PRESET_COLORS[0],
            priceListUrl: data.price_list_url || "",
          };
          setInitialState(loadedState);
          setSelectedTemplate(loadedState.template);
          setCompanyName(loadedState.companyName);
          setAddress(loadedState.address);
          setPhone(loadedState.phone);
          setEmail(loadedState.email);
          setCompanyLogo(loadedState.companyLogo);
          setSignatureUrl(loadedState.signatureUrl);
          setCurrency(loadedState.currency);
          setThemeColor(loadedState.themeColor);
          setPriceListUrl(loadedState.priceListUrl);
          setPriceListName(data.price_list_name || "");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleLogoUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setCompanyLogo(result.assets[0].uri);
    } catch (error: any) {
      console.error("Error picking logo:", error);
      alert("Failed to pick logo: " + error.message);
    }
  };

  const handleSignatureUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setSignatureUrl(result.assets[0].uri);
    } catch (error: any) {
      console.error("Error picking signature:", error);
      alert("Failed to pick signature: " + error.message);
    }
  };

  const handlePriceListUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/csv",
          "text/plain",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setPriceListUrl(result.assets[0].uri);
      setPriceListName(result.assets[0].name);
    } catch (error: any) {
      console.error("Error picking price list:", error);
      alert("Failed to pick file: " + error.message);
    }
  };

  const uploadFileToStorage = async (uri: string, pathPrefix: string, filename: string): Promise<string> => {
    if (!uri || uri.startsWith("http")) return uri;

    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError("Network request failed"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      csv: "text/csv",
      txt: "text/plain",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileRef = ref(storage, `${pathPrefix}/${user!.uid}/${Date.now()}_${safeFilename}`);
    await uploadBytes(fileRef, blob, { contentType });
    return await getDownloadURL(fileRef);
  };

  const handleSignatureOK = (signature: string) => {
    setShowSignatureCanvas(false);
    setSignatureUrl(signature);
  };

  const uploadImageToStorage = async (
    uri: string,
    pathPrefix: string,
  ): Promise<string> => {
    if (!uri || uri.startsWith("http")) return uri;

    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const isDataUri = uri.startsWith("data:");
    const filename = isDataUri
      ? "drawn.png"
      : uri.split("/").pop() || "upload.jpg";
    const fileRef = ref(
      storage,
      `${pathPrefix}/${user!.uid}/${Date.now()}_${filename}`,
    );

    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!companyName.trim()) {
      alert("Please enter your company name.");
      return;
    }

    setLoading(true);
    try {
      const finalLogoUrl = await uploadImageToStorage(companyLogo, "logos");
      const finalSignatureUrl = await uploadImageToStorage(signatureUrl, "signatures");
      const finalPriceListUrl = priceListUrl
        ? await uploadFileToStorage(priceListUrl, "price_lists", priceListName || "pricelist.pdf")
        : "";

      // Helper to delete old image from Firebase Storage
      const deleteOldImage = async (oldUrl: string, newUrl: string) => {
        if (oldUrl && oldUrl !== newUrl && oldUrl.includes("firebasestorage")) {
          try {
            const oldRef = ref(storage, oldUrl);
            await deleteObject(oldRef);
            console.log("Deleted old image:", oldUrl);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      };

      await deleteOldImage(initialState.companyLogo, finalLogoUrl);
      await deleteOldImage(initialState.signatureUrl, finalSignatureUrl);

      const customizationRef = doc(
        db,
        "users",
        user.uid,
        "settings",
        "invoice",
      );
      await setDoc(
        customizationRef,
        {
          template: selectedTemplate,
          companyName,
          address,
          phone,
          email,
          company_logo: finalLogoUrl,
          signature_url: finalSignatureUrl,
          currency,
          theme_color: themeColor,
          price_list_url: finalPriceListUrl,
          price_list_name: finalPriceListUrl ? priceListName : "",
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setCompanyLogo(finalLogoUrl);
      setSignatureUrl(finalSignatureUrl);
      setPriceListUrl(finalPriceListUrl);
      setInitialState({
        template: selectedTemplate,
        companyName,
        address,
        phone,
        email,
        companyLogo: finalLogoUrl,
        signatureUrl: finalSignatureUrl,
        currency,
        themeColor,
        priceListUrl: finalPriceListUrl,
      });

      router.back();
    } catch (e: any) {
      console.error(e);
      alert("Failed to save settings: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const openTemplatePreview = async (templateId: string) => {
    setPreviewTemplateId(templateId);
    setPreviewHtml(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(CONFIG.api.endpoints.templatePreview(templateId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_color: themeColor }),
      });
      if (!res.ok) throw new Error("Failed to load template preview");
      let html = await res.text();
      html = html.replace(
        /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/i,
        '<meta name="viewport" content="width=1024">',
      );
      setPreviewHtml(html);
    } catch (e) {
      console.error("Error fetching template preview:", e);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={styles.headerTitle}>Template Settings</Text>
            <Text style={styles.headerSubtitle}>
              Update your default invoice template and business details.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Invoice Template</Text>
            <View style={styles.templateGrid}>
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={[
                      styles.templateCard,
                      isSelected && {
                        borderColor: tmpl.color,
                        backgroundColor: `${tmpl.color}15`,
                      },
                    ]}
                    onPress={() => setSelectedTemplate(tmpl.id)}
                  >
                    <View
                      style={[
                        styles.templatePreviewBox,
                        isSelected && {
                          borderColor: tmpl.color,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <TemplatePreview type={tmpl.id} color={tmpl.color} />
                      {(tmpl as any).isPremium && (
                        <View style={styles.premiumBadge}>
                          <Crown color="#fff" size={10} />
                          <Text style={styles.premiumText}>PRO</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.templateEyeBtn}
                        onPress={() => openTemplatePreview(tmpl.id)}
                      >
                        <Eye color="#fff" size={12} />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        styles.templateName,
                        isSelected && { color: tmpl.color, fontWeight: "bold" },
                      ]}
                    >
                      {tmpl.name}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: tmpl.color },
                        ]}
                      >
                        <Check color="#fff" size={12} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Theme Color</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a primary color for your invoice elements.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorPalette}
            >
              {PRESET_COLORS.map((color) => {
                const isSelected = themeColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setThemeColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      isSelected && styles.colorSwatchSelected,
                    ]}
                  >
                    {isSelected && (
                      <Check
                        color={
                          color === "#000000" || color === "#18181B"
                            ? "#fff"
                            : "#fff"
                        }
                        size={16}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Business Details</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Building2 color="#A1A1AA" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Company Name"
                placeholderTextColor="#A1A1AA"
                value={companyName}
                onChangeText={setCompanyName}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin color="#A1A1AA" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Business Address"
                placeholderTextColor="#A1A1AA"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Phone color="#A1A1AA" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#A1A1AA"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <Mail color="#A1A1AA" size={20} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Business Email"
                placeholderTextColor="#A1A1AA"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={styles.inputGroup}
              onPress={() => {
                setCurrencySearchQuery("");
                setCurrencySearchResults(searchCurrency(""));
                setShowCurrencyModal(true);
              }}
            >
              <View style={styles.inputIcon}>
                <DollarSign color="#A1A1AA" size={20} />
              </View>
              <View style={[styles.input, { justifyContent: "center" }]}>
                <Text
                  style={{
                    color: currency ? "#FAFAFA" : "#A1A1AA",
                    fontSize: 16,
                  }}
                >
                  {currency ? currency : "Select Currency"}
                </Text>
              </View>
            </TouchableOpacity>

            {!showSignatureCanvas && (
              <>
                <View style={{ marginTop: 16, marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FAFAFA",
                    }}
                  >
                    Business Logo
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#A1A1AA", marginTop: 4 }}
                  >
                    Add your company logo to display on invoices.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.logoUploadBtn}
                  onPress={handleLogoUpload}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <ActivityIndicator color="#4F46E5" size="small" />
                  ) : companyLogo ? (
                    <Image
                      source={{ uri: companyLogo }}
                      style={{ width: 100, height: 100, resizeMode: "contain" }}
                    />
                  ) : (
                    <>
                      <ImageIcon
                        color="#4F46E5"
                        size={24}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.logoUploadText}>
                        Upload Business Logo (Optional)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={{ marginTop: 24, marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FAFAFA",
                    }}
                  >
                    Signature
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#A1A1AA", marginTop: 4 }}
                  >
                    Upload or draw your signature for sign-offs.
                  </Text>
                </View>
              </>
            )}

            {!showSignatureCanvas ? (
              signatureUrl ? (
                <View style={{ marginTop: 0 }}>
                  <TouchableOpacity
                    style={[
                      styles.logoUploadBtn,
                      {
                        height: 120,
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E4E4E7",
                      },
                    ]}
                    onPress={() => setShowSignatureCanvas(true)}
                    disabled={uploadingSignature}
                  >
                    {uploadingSignature ? (
                      <ActivityIndicator color="#4F46E5" size="small" />
                    ) : (
                      <Image
                        source={{ uri: signatureUrl }}
                        style={{
                          width: "100%",
                          height: 100,
                          resizeMode: "contain",
                        }}
                      />
                    )}
                  </TouchableOpacity>
                  <View
                    style={{ flexDirection: "row", gap: 12, marginTop: 12 }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.logoUploadBtn,
                        { flex: 1, marginTop: 0, paddingVertical: 12 },
                      ]}
                      onPress={handleSignatureUpload}
                      disabled={uploadingSignature}
                    >
                      <ImageIcon
                        color="#4F46E5"
                        size={16}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.logoUploadText, { fontSize: 12 }]}>
                        Upload New
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.logoUploadBtn,
                        { flex: 1, marginTop: 0, paddingVertical: 12 },
                      ]}
                      onPress={() => setShowSignatureCanvas(true)}
                      disabled={uploadingSignature}
                    >
                      <PenTool
                        color="#4F46E5"
                        size={16}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.logoUploadText, { fontSize: 12 }]}>
                        Draw New
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 12, marginTop: 0 }}>
                  <TouchableOpacity
                    style={[styles.logoUploadBtn, { flex: 1, marginTop: 0 }]}
                    onPress={handleSignatureUpload}
                    disabled={uploadingSignature}
                  >
                    {uploadingSignature && !showSignatureCanvas ? (
                      <ActivityIndicator color="#4F46E5" size="small" />
                    ) : (
                      <>
                        <ImageIcon
                          color="#4F46E5"
                          size={20}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.logoUploadText, { fontSize: 12 }]}>
                          Upload Signature
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.logoUploadBtn, { flex: 1, marginTop: 0 }]}
                    onPress={() => setShowSignatureCanvas(true)}
                    disabled={uploadingSignature}
                  >
                    <PenTool
                      color="#4F46E5"
                      size={20}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.logoUploadText, { fontSize: 12 }]}>
                      Draw Signature
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <Animated.View
                entering={FadeInDown.duration(400)}
                style={{ marginTop: 16 }}
              >
                <View
                  style={{
                    height: 260,
                    backgroundColor: "#18181B",
                    borderRadius: 16,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#27272A",
                  }}
                >
                  <View
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#27272A",
                      backgroundColor: "#18181B",
                    }}
                  >
                    <Text
                      style={{
                        color: "#A1A1AA",
                        fontSize: 13,
                        fontWeight: "500",
                        textAlign: "center",
                      }}
                    >
                      Draw your signature below
                    </Text>
                  </View>
                  <SignatureScreen
                    ref={signatureRef}
                    onOK={handleSignatureOK}
                    onEmpty={() => alert("Please sign before saving")}
                    onBegin={() => setScrollEnabled(false)}
                    onEnd={() => setScrollEnabled(true)}
                    descriptionText=""
                    clearText="Clear"
                    confirmText="Save Signature"
                    webStyle={`
                      .m-signature-pad { box-shadow: none; border: none; margin: 0; padding: 0; background-color: #FAFAFA; }
                      .m-signature-pad--body { border: none; }
                      .m-signature-pad--footer { display: none; }
                    `}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      backgroundColor: "#18181B",
                      borderTopWidth: 1,
                      borderTopColor: "#27272A",
                      justifyContent: "flex-end",
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowSignatureCanvas(false);
                        setScrollEnabled(true);
                      }}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: "transparent",
                        borderWidth: 1,
                        borderColor: "#3F3F46",
                      }}
                    >
                      <Text style={{ color: "#A1A1AA", fontWeight: "600" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => signatureRef.current?.clearSignature()}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: "#27272A",
                        borderWidth: 1,
                        borderColor: "#3F3F46",
                      }}
                    >
                      <Text style={{ color: "#FAFAFA", fontWeight: "600" }}>
                        Clear
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => signatureRef.current?.readSignature()}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: "#4F46E5",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Price List */}
            {!showSignatureCanvas && (
              <>
                <View style={{ marginTop: 24, marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#FAFAFA" }}>
                    Price List
                  </Text>
                  <Text style={{ fontSize: 13, color: "#A1A1AA", marginTop: 4 }}>
                    Upload your rates so AI uses your exact prices when generating invoices. Supports PDF, CSV, Excel, Word, and more.
                  </Text>
                </View>

                {priceListUrl ? (
                  <View style={[styles.logoUploadBtn, { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
                      <FileText color="#4F46E5" size={20} />
                      <Text
                        style={[styles.logoUploadText, { flex: 1 }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {priceListName || "Price list uploaded"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { setPriceListUrl(""); setPriceListName(""); }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X color="#A1A1AA" size={18} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.logoUploadBtn} onPress={handlePriceListUpload}>
                    <FileText color="#4F46E5" size={24} style={{ marginRight: 8 }} />
                    <Text style={styles.logoUploadText}>Upload Price List (Optional)</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (loading || !hasChanges) && {
                opacity: 0.7,
                backgroundColor: !hasChanges ? "#3F3F46" : "#4F46E5",
              },
            ]}
            onPress={handleSave}
            disabled={loading || !hasChanges}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.saveBtnText,
                  !hasChanges && { color: "#A1A1AA" },
                ]}
              >
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Currency Selection Modal */}
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
            <TouchableWithoutFeedback
              onPress={() => setShowCurrencyModal(false)}
            >
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
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Currency</Text>
                  <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                    <X color="#A1A1AA" size={24} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.searchInputGroup}>
                <Search color="#A1A1AA" size={20} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search currency (e.g. USD, Euro)"
                  placeholderTextColor="#A1A1AA"
                  value={currencySearchQuery}
                  onChangeText={(text) => {
                    setCurrencySearchQuery(text);
                    setCurrencySearchResults(searchCurrency(text));
                  }}
                  autoFocus
                />
              </View>

              <ScrollView style={styles.currencyList}>
                {currencySearchResults.length > 0 ? (
                  currencySearchResults.map((curr) => (
                    <TouchableOpacity
                      key={curr.code}
                      style={styles.currencyItem}
                      onPress={() => {
                        setCurrency(curr.code);
                        setShowCurrencyModal(false);
                      }}
                    >
                      <View>
                        <Text style={styles.currencyCode}>{curr.code}</Text>
                        <Text style={styles.currencyName}>{curr.name}</Text>
                      </View>
                      <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                    </TouchableOpacity>
                  ))
                ) : currencySearchQuery.trim() === "" ? (
                  <Text style={styles.emptySearchText}>
                    Type to search currencies...
                  </Text>
                ) : (
                  <Text style={styles.emptySearchText}>
                    No currencies found
                  </Text>
                )}
              </ScrollView>
            </RNAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        visible={previewTemplateId !== null}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setPreviewTemplateId(null);
          setPreviewHtml(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#09090B" }}>
          <View style={[styles.templatePreviewModalHeader, { paddingTop: insets.top + 14 }]}>
            <TouchableOpacity
              onPress={() => {
                setPreviewTemplateId(null);
                setPreviewHtml(null);
              }}
              style={styles.templatePreviewModalClose}
            >
              <X color="#fff" size={22} />
            </TouchableOpacity>
            <Text style={styles.templatePreviewModalTitle}>
              {TEMPLATES.find((t) => t.id === previewTemplateId)?.name} Template
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (previewTemplateId) setSelectedTemplate(previewTemplateId);
                setPreviewTemplateId(null);
                setPreviewHtml(null);
              }}
              style={[
                styles.templatePreviewModalSelect,
                {
                  backgroundColor:
                    TEMPLATES.find((t) => t.id === previewTemplateId)?.color ||
                    "#4F46E5",
                },
              ]}
            >
              <Text style={styles.templatePreviewModalSelectText}>Select</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {previewLoading ? (
              <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 15 }}>
                  Loading preview...
                </Text>
              </View>
            ) : previewHtml ? (
              <WebView
                originWhitelist={["*"]}
                source={{ html: previewHtml }}
                style={{ flex: 1 }}
                scalesPageToFit={true}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FAFAFA",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#A1A1AA",
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FAFAFA",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#A1A1AA",
    marginBottom: 16,
    marginTop: -8,
  },
  colorPalette: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#fff",
    transform: [{ scale: 1.1 }],
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  templateCard: {
    width: "48%",
    backgroundColor: "#18181B",
    borderWidth: 2,
    borderColor: "#27272A",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    position: "relative",
  },
  templatePreviewBox: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#27272A",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  templateName: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "500",
  },
  checkBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#09090B",
  },
  premiumBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  premiumText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    marginBottom: 12,
    height: 56,
  },
  inputIcon: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: "100%",
  },
  logoUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.3)",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoUploadText: {
    color: "#818CF8",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 10 : 24,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
    backgroundColor: "#09090B",
  },
  saveBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#A1A1AA",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    padding: 24,
    paddingTop: 12,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#3F3F46",
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  searchInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  currencyCode: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  currencyName: {
    color: "#A1A1AA",
    fontSize: 14,
    marginTop: 2,
  },
  currencySymbol: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptySearchText: {
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  templateEyeBtn: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  templatePreviewModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#09090B",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  templatePreviewModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  templatePreviewModalTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  templatePreviewModalSelect: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  templatePreviewModalSelectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
