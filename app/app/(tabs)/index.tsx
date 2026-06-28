import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ScrollView,
  PanResponder,
  Animated as RNAnimated,
  Alert,
  Image,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { Video, ResizeMode } from "expo-av";
import { storage, db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import { CONFIG } from "../../config";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Type,
  Video as VideoIcon,
  Send,
  Paperclip,
  X,
  Sparkles,
  Check,
  DollarSign,
  Search,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { searchCurrency, Currency } from "../../utils/currency";
import { useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import { useSubscription } from "../../context/SubscriptionContext";
import TutorialOverlay, { LayoutRect } from "../../components/TutorialOverlay";

const logoWhite = require("../../assets/images/logo-white.png");
const logoBlack = require("../../assets/images/logo-black.png");

// Camera overlay UI is always dark — it renders on top of a live camera feed
const CAMERA_COLORS = {
  overlay: "rgba(0,0,0,0.6)",
  text: "#fff",
  textDim: "rgba(255,255,255,0.8)",
  recordOuter: "rgba(0,0,0,0.2)",
  recordDot: "#ef4444",
  processing: "rgba(18,18,18,0.8)",
  processingCard: "#1e1e1e",
  processingBorder: "#2c2c2c",
};

export default function CameraCaptureScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [inputMode, setInputMode] = useState<"video" | "text">("video");
  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");
  const [textInput, setTextInput] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [currency, setCurrency] = useState("USD");
  const [priceListUrl, setPriceListUrl] = useState<string | null>(null);
  const [priceListName, setPriceListName] = useState<string>("");
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  const [isUploadingPriceList, setIsUploadingPriceList] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");
  const [currencySearchResults, setCurrencySearchResults] = useState<Currency[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const isRecordingRef = useRef(false);
  const currencyBadgeRef = useRef<any>(null);
  const pricesBadgeRef = useRef<any>(null);
  const modeToggleRef = useRef<any>(null);
  const recordBtnRef = useRef<any>(null);
  const [currencyBadgeRect, setCurrencyBadgeRect] = useState<LayoutRect | undefined>();
  const [pricesBadgeRect, setPricesBadgeRect] = useState<LayoutRect | undefined>();
  const [modeToggleRect, setModeToggleRect] = useState<LayoutRect | undefined>();
  const [recordButtonRect, setRecordButtonRect] = useState<LayoutRect | undefined>();
  const { user, userProfile } = useAuth();
  const { isPro } = useSubscription();
  const { colors, resolvedTheme } = useTheme();
  const styles = createStyles(colors);
  const cameraStyles = createCameraStyles(colors);
  const router = useRouter();

  const panY = useRef(new RNAnimated.Value(0)).current;
  const priceListPanY = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (showCurrencyModal) panY.setValue(0);
  }, [showCurrencyModal]);

  useEffect(() => {
    if (showPriceListModal) priceListPanY.setValue(0);
  }, [showPriceListModal]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: RNAnimated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 1.5) setShowCurrencyModal(false);
        else RNAnimated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const priceListPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: RNAnimated.event([null, { dy: priceListPanY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.2) setShowPriceListModal(false);
        else RNAnimated.spring(priceListPanY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  useFocusEffect(
    useCallback(() => {
      const fetchCurrency = async () => {
        if (!user) return;
        try {
          const settingsDoc = await db().collection("users").doc(user.uid).collection("settings").doc("invoice").get();
          if (settingsDoc.exists) {
            const data = settingsDoc.data();
            if (!data) return;
            if (data.currency) setCurrency(data.currency);
            setPriceListUrl(data.price_list_url || null);
            setPriceListName(data.price_list_name || "");
          }
        } catch (error) {
          console.error("Error fetching currency:", error);
        }
      };
      fetchCurrency();
    }, [user]),
  );

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermission();
  }, [cameraPermission, microphonePermission]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(60);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    if (timer === 0 && isRecordingRef.current) {
      isRecordingRef.current = false;
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    }
  }, [timer]);

  function measureElement(ref: React.RefObject<any>, setRect: (r: LayoutRect) => void) {
    ref.current?.measure((_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
      setRect({ x: pageX, y: pageY, width, height });
    });
  }

  const handleTutorialComplete = async () => {
    if (!user) return;
    try {
      await db().collection("users").doc(user.uid).set({ hasSeenTutorial: true }, { merge: true });
    } catch (e) {
      console.error("Failed to mark tutorial complete:", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleRecord = async () => {
    if (!cameraRef.current) return;
    if (isRecording) {
      if (!isRecordingRef.current) return;
      isRecordingRef.current = false;
      try { cameraRef.current.stopRecording(); } catch (e) { console.error("stopRecording error", e); }
      setIsRecording(false);
    } else {
      isRecordingRef.current = true;
      setIsRecording(true);
      try {
        const data = await cameraRef.current.recordAsync({ maxDuration: 60, maxFileSize: 75 * 1024 * 1024 });
        if (data?.uri) setRecordedVideoUri(data.uri);
      } catch (e) {
        console.error("Recording error", e);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    }
  };

  const processVideo = async (uri: string) => {
    if (!isPro) {
      const snap = await db().collection("invoices").where("user_id", "==", user?.uid).count().get();
      if (snap.data().count >= 5) {
        Alert.alert(
          "Invoice Limit Reached",
          "Free accounts are limited to 5 invoices. Upgrade to Pro for unlimited.",
          [
            { text: "Not Now", style: "cancel" },
            { text: "Upgrade", onPress: () => router.push("/paywall") },
          ]
        );
        return;
      }
    }
    const promptText = textInput.trim() || "Analyze this video to generate an itemized quote.";
    setTextInput("");
    alert("Video is uploading and processing in the background. Check the Invoices tab for updates.");
    router.push("/(tabs)/two");
    const invoiceDocRef = db().collection("invoices").doc();
    const invoiceId = invoiceDocRef.id;
    try {
      await invoiceDocRef.set({ user_id: user?.uid, project_name: "New Project", date: new Date().toISOString().split("T")[0], status: "processing", payment_status: "unpaid", amount_paid: 0, created_at: Date.now(), currency, line_items: [], subtotal: 0, taxes: 0, total: 0 });
    } catch (e: any) { console.error("Failed to write invoice stub:", e.message); }
    try {
      const blob = await (await fetch(uri)).blob();
      const storageRef = storage().ref(`quotes/${user?.uid}/${Date.now()}.mov`);
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();
      await invoiceDocRef.set({ media_url: downloadURL }, { merge: true });
      const token = await user?.getIdToken();
      await fetch(CONFIG.api.endpoints.generateQuote, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice_id: invoiceId, media_urls: [downloadURL], prompt: promptText, currency, ...(priceListUrl && { price_list_url: priceListUrl }) }),
      });
    } catch (e: any) { alert("Error processing video: " + e.message); }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "text/plain", "text/csv", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets.length > 0) setSelectedDoc(result.assets[0]);
    } catch (err) { console.error("Error picking document", err); }
  };

  const handleSendText = async () => {
    if (!textInput.trim() && !selectedDoc) return;
    if (!isPro) {
      const snap = await db().collection("invoices").where("user_id", "==", user?.uid).count().get();
      if (snap.data().count >= 5) {
        Alert.alert(
          "Invoice Limit Reached",
          "Free accounts are limited to 5 invoices. Upgrade to Pro for unlimited.",
          [
            { text: "Not Now", style: "cancel" },
            { text: "Upgrade", onPress: () => router.push("/paywall") },
          ]
        );
        return;
      }
    }
    alert("Your request is processing in the background. Check the Invoices tab for updates.");
    router.push("/(tabs)/two");
    const currentText = textInput;
    const currentDoc = selectedDoc;
    setTextInput("");
    setSelectedDoc(null);
    Keyboard.dismiss();
    const invoiceDocRef = db().collection("invoices").doc();
    const invoiceId = invoiceDocRef.id;
    try {
      await invoiceDocRef.set({ user_id: user?.uid, project_name: currentDoc?.name?.split(".")[0] || "New Project", date: new Date().toISOString().split("T")[0], status: "processing", payment_status: "unpaid", amount_paid: 0, created_at: Date.now(), currency, line_items: [], subtotal: 0, taxes: 0, total: 0 });
    } catch (e: any) { console.error("Failed to write invoice stub:", e.message); }
    try {
      let documentURL = null;
      if (currentDoc) {
        const blob = await (await fetch(currentDoc.uri)).blob();
        const extension = currentDoc.name.split(".").pop() || "pdf";
        const storageRef = storage().ref(`quotes/${user?.uid}/${Date.now()}.${extension}`);
        let mimeType = currentDoc.mimeType;
        if (!mimeType) {
          if (extension === "pdf") mimeType = "application/pdf";
          else if (extension === "txt") mimeType = "text/plain";
          else if (extension === "csv") mimeType = "text/csv";
          else if (extension === "docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          else mimeType = "image/jpeg";
        }
        await storageRef.put(blob, { contentType: mimeType });
        documentURL = await storageRef.getDownloadURL();
        await invoiceDocRef.set({ media_url: documentURL }, { merge: true });
      }
      const token = await user?.getIdToken();
      const payload: any = { invoice_id: invoiceId, prompt: currentText || "Analyze the attached document to generate a quote.", currency };
      if (documentURL) { payload.media_urls = [documentURL]; payload.project_name = currentDoc?.name?.split(".")[0] || "New Project"; }
      if (priceListUrl) payload.price_list_url = priceListUrl;
      await fetch(CONFIG.api.endpoints.generateQuote, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } catch (e: any) { alert("Error processing text request: " + e.message); }
  };

  const handlePickPriceList = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/csv", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setIsUploadingPriceList(true);
      const blob = await (await fetch(asset.uri)).blob();
      const ext = asset.name.split(".").pop()?.toLowerCase() || "pdf";
      const mimeMap: Record<string, string> = { pdf: "application/pdf", csv: "text/csv", txt: "text/plain", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };
      const safeFilename = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageRef = storage().ref(`price_lists/${user?.uid}/${Date.now()}_${safeFilename}`);
      await storageRef.put(blob, { contentType: mimeMap[ext] || "application/octet-stream" });
      const downloadURL = await storageRef.getDownloadURL();
      await db().collection("users").doc(user!.uid).collection("settings").doc("invoice").set({ price_list_url: downloadURL, price_list_name: asset.name }, { merge: true });
      setPriceListUrl(downloadURL);
      setPriceListName(asset.name);
      setShowPriceListModal(false);
    } catch (e: any) {
      alert("Failed to upload price list: " + e.message);
    } finally { setIsUploadingPriceList(false); }
  };

  const handleRemovePriceList = async () => {
    try {
      if (priceListUrl) {
        try { await storage().refFromURL(priceListUrl).delete(); } catch {}
      }
      await db().collection("users").doc(user!.uid).collection("settings").doc("invoice").set({ price_list_url: "", price_list_name: "" }, { merge: true });
      setPriceListUrl(null);
      setPriceListName("");
      setShowPriceListModal(false);
    } catch (e: any) { alert("Failed to remove price list: " + e.message); }
  };

  // Processing overlay — always dark
  const renderProcessing = (title: string) => (
    <View style={[StyleSheet.absoluteFillObject, cameraStyles.processingOverlay]}>
      <Animated.View entering={FadeIn.duration(500)} style={cameraStyles.processingContent}>
        <ActivityIndicator size="large" color="#818CF8" style={{ marginBottom: 16 }} />
        <View style={cameraStyles.processingTitleRow}>
          <Sparkles color="#818CF8" size={24} />
          <Text style={cameraStyles.processingTitle}>{title}</Text>
        </View>
        <Text style={cameraStyles.processingSub}>Preparing media for processing...</Text>
      </Animated.View>
    </View>
  );

  const renderHeader = () => {
    const logo = resolvedTheme === "dark" ? logoWhite : logoBlack;
    return (
      <View style={cameraStyles.header}>
        <Image source={logo} style={cameraStyles.logoImage} resizeMode="contain" />
        <TouchableOpacity
          ref={currencyBadgeRef}
          style={cameraStyles.currencyBadge}
          onPress={() => { setCurrencySearchQuery(""); setCurrencySearchResults(searchCurrency("")); setShowCurrencyModal(true); }}
          onLayout={() => measureElement(currencyBadgeRef, setCurrencyBadgeRect)}
        >
          <DollarSign color="#4F46E5" size={15} />
          <Text style={cameraStyles.currencyText}>{currency}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderModePills = () => (
    <View
      ref={modeToggleRef}
      style={cameraStyles.modePillsRow}
      onLayout={() => measureElement(modeToggleRef, setModeToggleRect)}
    >
      <TouchableOpacity
        style={[cameraStyles.modePill, inputMode === "video" && cameraStyles.modePillActive]}
        onPress={() => setInputMode("video")}
      >
        <VideoIcon color={inputMode === "video" ? "#fff" : colors.textSecondary} size={15} />
        <Text style={[cameraStyles.modePillText, inputMode === "video" && cameraStyles.modePillTextActive]}>Video</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[cameraStyles.modePill, inputMode === "text" && !selectedDoc && cameraStyles.modePillActive]}
        onPress={() => { setSelectedDoc(null); setInputMode("text"); }}
      >
        <Type color={inputMode === "text" && !selectedDoc ? "#fff" : colors.textSecondary} size={15} />
        <Text style={[cameraStyles.modePillText, inputMode === "text" && !selectedDoc && cameraStyles.modePillTextActive]}>Text</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[cameraStyles.modePill, !!selectedDoc && cameraStyles.modePillActive]}
        onPress={async () => { await handlePickDocument(); setInputMode("text"); }}
      >
        <Paperclip color={selectedDoc ? "#fff" : colors.textSecondary} size={15} />
        <Text style={[cameraStyles.modePillText, !!selectedDoc && cameraStyles.modePillTextActive]}>Document</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVideoBody = () => {
    if (!cameraPermission || !microphonePermission) {
      return (
        <View style={styles.centerAll}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      );
    }
    if (!cameraPermission.granted || !microphonePermission.granted) {
      return (
        <View style={styles.centerAll}>
          <FileText color={colors.accent} size={48} style={{ marginBottom: 20 }} />
          <Text style={styles.permissionText}>We need access to your camera and mic to generate quotes.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={() => { requestCameraPermission(); requestMicrophonePermission(); }}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (recordedVideoUri) {
      return (
        <View style={cameraStyles.viewfinder}>
          <Video
            source={{ uri: recordedVideoUri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={false}
          />
          {isProcessing ? renderProcessing("Analyzing Video...") : (
            <View style={cameraStyles.reviewButtonsOverlay}>
              <TouchableOpacity style={cameraStyles.reviewButtonCancel} onPress={() => setRecordedVideoUri(null)}>
                <X color="#fff" size={24} />
                <Text style={cameraStyles.reviewButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={cameraStyles.reviewButtonSend} onPress={() => { processVideo(recordedVideoUri); setRecordedVideoUri(null); }}>
                <Check color="#fff" size={24} />
                <Text style={cameraStyles.reviewButtonText}>Use Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return (
      <>
        {/* Viewfinder wrapper — CameraView has zero React children to avoid Fabric index desync */}
        <View style={cameraStyles.viewfinder}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={cameraFacing}
            ref={cameraRef}
            mode="video"
            videoQuality="480p"
          />

          {/* Corner bracket markers */}
          <View style={[cameraStyles.corner, cameraStyles.cornerTL]} />
          <View style={[cameraStyles.corner, cameraStyles.cornerTR]} />
          <View style={[cameraStyles.corner, cameraStyles.cornerBL]} />
          <View style={[cameraStyles.corner, cameraStyles.cornerBR]} />

          {/* REC badge + timer when recording */}
          {isRecording && (
            <View style={cameraStyles.recRow}>
              <View style={cameraStyles.recBadge}>
                <View style={cameraStyles.recDot} />
                <Text style={cameraStyles.recText}>REC</Text>
              </View>
              <Text style={cameraStyles.recTimer}>{formatTime(timer)}</Text>
            </View>
          )}

          {/* Instruction text when idle */}
          {!isRecording && (
            <Text style={cameraStyles.instructionText}>Record the space to generate a quote</Text>
          )}

          {/* Record button + flip button */}
          {!isProcessing && (
            <View style={cameraStyles.viewfinderControls}>
              <TouchableOpacity
                ref={recordBtnRef}
                style={cameraStyles.recordOuter}
                onPress={handleRecord}
                activeOpacity={0.8}
                onLayout={() => measureElement(recordBtnRef, setRecordButtonRect)}
              >
                <View style={[cameraStyles.recordInner, isRecording && cameraStyles.recordingInner]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={cameraStyles.flipButton}
                onPress={() => setCameraFacing(f => f === "back" ? "front" : "back")}
              >
                <RefreshCw color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          )}

          {isProcessing && renderProcessing("Analyzing Video...")}
        </View>

        {/* Price list chips below viewfinder */}
        <View style={cameraStyles.promptArea}>
          <View
            ref={pricesBadgeRef}
            style={cameraStyles.chipsRow}
            onLayout={() => measureElement(pricesBadgeRef, setPricesBadgeRect)}
          >
            {priceListUrl ? (
              <TouchableOpacity
                style={[cameraStyles.chip, cameraStyles.chipActive]}
                onPress={() => setShowPriceListModal(true)}
              >
                <FileText color={colors.success} size={13} />
                <Text style={[cameraStyles.chipText, { color: colors.success }]}>
                  {priceListName || "Prices ✓"}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={cameraStyles.chip}>
                  <FileText color={colors.textSecondary} size={13} />
                  <Text style={cameraStyles.chipText}>No price list</Text>
                </View>
                <TouchableOpacity style={cameraStyles.chipCta} onPress={() => setShowPriceListModal(true)}>
                  <Plus color="#818CF8" size={13} />
                  <Text style={cameraStyles.chipCtaText}>Add price list</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </>
    );
  };

  const renderTextBody = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.textModeInner}>
          {isProcessing ? renderProcessing("Analyzing Request...") : (
            <View style={styles.textInputContainer}>
              <Text style={styles.textModeTitle}>Describe your project</Text>
              <Text style={styles.textModeSub}>Be as detailed as possible to get an accurate quote.</Text>

              {selectedDoc && (
                <View style={styles.documentBadge}>
                  <Paperclip color={colors.accentLight} size={16} />
                  <Text style={styles.documentName} numberOfLines={1} ellipsizeMode="middle">{selectedDoc.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                    <X color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                style={styles.textInput}
                multiline
                placeholder="e.g. I need to remodel my 200 sq ft kitchen. New cabinets, quartz countertops, and a tile backsplash..."
                placeholderTextColor={colors.textDisabled}
                value={textInput}
                onChangeText={setTextInput}
              />

              <View style={styles.textActionRow}>
                <TouchableOpacity style={styles.attachButton} onPress={handlePickDocument} disabled={isProcessing}>
                  <Paperclip color={colors.textSecondary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, !textInput.trim() && !selectedDoc && styles.sendButtonDisabled]}
                  onPress={handleSendText}
                  disabled={(!textInput.trim() && !selectedDoc) || isProcessing}
                >
                  <Send color={textInput.trim() || selectedDoc ? "#fff" : colors.textDisabled} size={20} />
                  <Text style={[styles.sendButtonText, !textInput.trim() && !selectedDoc && styles.sendButtonTextDisabled]}>Generate Quote</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const showModePills = !isRecording && !recordedVideoUri &&
    (inputMode === "text" || (!!cameraPermission?.granted && !!microphonePermission?.granted));

  return (
    <View style={styles.container}>
      {/* Stable top chrome — never remounts on tab switch */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        {renderHeader()}
        {showModePills && renderModePills()}
      </SafeAreaView>

      {inputMode === "video" ? renderVideoBody() : renderTextBody()}

      {/* Price List Modal */}
      <Modal visible={showPriceListModal} transparent animationType="slide" onRequestClose={() => setShowPriceListModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowPriceListModal(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <RNAnimated.View style={[styles.modalContent, { height: "auto", paddingBottom: 36, transform: [{ translateY: priceListPanY.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] }]}>
            <View {...priceListPanResponder.panHandlers}>
              <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
            </View>
            <Text style={styles.modalTitle}>Price List</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
              Upload your rates so the AI uses your exact prices when generating invoices.
            </Text>
            {priceListUrl ? (
              <>
                <View style={styles.priceListFileCard}>
                  <FileText color={colors.success} size={22} />
                  <Text style={styles.priceListFileName} numberOfLines={2}>{priceListName || "Price list"}</Text>
                </View>
                <TouchableOpacity style={styles.priceListActionBtn} onPress={handlePickPriceList} disabled={isUploadingPriceList}>
                  {isUploadingPriceList ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.priceListActionBtnText}>Replace File</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.priceListActionBtn, styles.priceListRemoveBtn]} onPress={handleRemovePriceList} disabled={isUploadingPriceList}>
                  <Trash2 color={colors.error} size={16} />
                  <Text style={[styles.priceListActionBtnText, { color: colors.error }]}>Remove Price List</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.priceListUploadBtn} onPress={handlePickPriceList} disabled={isUploadingPriceList}>
                {isUploadingPriceList ? (
                  <>
                    <ActivityIndicator color={colors.accent} size="small" style={{ marginBottom: 8 }} />
                    <Text style={styles.priceListUploadText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <FileText color={colors.accent} size={28} style={{ marginBottom: 8 }} />
                    <Text style={styles.priceListUploadText}>Upload Price List</Text>
                    <Text style={styles.priceListUploadSub}>PDF, CSV, Excel, Word, TXT</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </RNAnimated.View>
        </View>
      </Modal>

      {/* First-time onboarding tutorial */}
      <TutorialOverlay
        visible={!!(userProfile?.hasCompletedOnboarding && !userProfile?.hasSeenTutorial)}
        onComplete={handleTutorialComplete}
        currencyBadgeRect={currencyBadgeRect}
        pricesBadgeRect={pricesBadgeRect}
        modeToggleRect={modeToggleRect}
        recordButtonRect={recordButtonRect}
      />

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowCurrencyModal(false)}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <RNAnimated.View style={[styles.modalContent, { transform: [{ translateY: panY.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] }]}>
              <View {...panResponder.panHandlers}>
                <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Currency</Text>
                  <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                    <X color={colors.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.searchInputGroup}>
                <Search color={colors.textSecondary} size={20} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search currency (e.g. USD, Euro)"
                  placeholderTextColor={colors.textSecondary}
                  value={currencySearchQuery}
                  onChangeText={(text) => { setCurrencySearchQuery(text); setCurrencySearchResults(searchCurrency(text)); }}
                  autoFocus
                />
              </View>
              <ScrollView style={styles.currencyList}>
                {currencySearchResults.length > 0 ? (
                  currencySearchResults.map((curr) => (
                    <TouchableOpacity key={curr.code} style={styles.currencyItem} onPress={() => { setCurrency(curr.code); setShowCurrencyModal(false); }}>
                      <View>
                        <Text style={styles.currencyCode}>{curr.code}</Text>
                        <Text style={styles.currencyName}>{curr.name}</Text>
                      </View>
                      <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptySearchText}>{currencySearchQuery.trim() === "" ? "Type to search currencies..." : "No currencies found"}</Text>
                )}
              </ScrollView>
            </RNAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Camera chrome styles — camera-overlay items stay dark; surrounding chrome follows theme
const createCameraStyles = (c: AppColors) => StyleSheet.create({
  // Full-screen camera (review state)
  camera: { flex: 1 },
  safeArea: { flex: 1, justifyContent: "space-between" },
  overlay: { justifyContent: "flex-end", paddingBottom: 40, paddingHorizontal: 20 },

  // New bounded-camera layout
  videoModeContainer: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoImage: {
    height: 28,
    width: 120,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
  },
  currencyText: { color: c.textPrimary, fontWeight: "600", fontSize: 14 },

  // Mode pills
  modePillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 20,
  },
  modePillActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  modePillText: { color: c.textSecondary, fontWeight: "600", fontSize: 13 },
  modePillTextActive: { color: "#fff" },

  // Bounded viewfinder
  viewfinder: { flex: 1 },

  // Corner bracket markers
  corner: { position: "absolute", width: 22, height: 22 },
  cornerTL: { top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "#818CF8", borderTopLeftRadius: 3 },
  cornerTR: { top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#818CF8", borderTopRightRadius: 3 },
  cornerBL: { bottom: 92, left: 14, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: "#818CF8", borderBottomLeftRadius: 3 },
  cornerBR: { bottom: 92, right: 14, borderBottomWidth: 2, borderRightWidth: 2, borderColor: "#818CF8", borderBottomRightRadius: 3 },

  // REC indicator
  recRow: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  recDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#fff" },
  recText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  recTimer: { color: "#fff", fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },

  instructionText: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "500",
  },

  // Viewfinder controls (record + flip)
  viewfinderControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  recordOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CAMERA_COLORS.recordOuter,
  },
  recordInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: CAMERA_COLORS.recordDot },
  recordingInner: { width: 28, height: 28, borderRadius: 6 },
  flipButton: {
    position: "absolute",
    right: 24,
    bottom: 22,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Prompt area below viewfinder
  promptArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: c.background,
    gap: 8,
  },
  promptInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  promptTextInput: {
    flex: 1,
    color: c.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(79,70,229,0.18)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipCtaText: { color: "#818CF8", fontSize: 12, fontWeight: "600" },
  chipActive: {
    backgroundColor: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.3)",
  },
  chipText: { color: c.textSecondary, fontSize: 12, fontWeight: "500" },

  // Processing overlay
  processingOverlay: { backgroundColor: CAMERA_COLORS.processing, justifyContent: "center", alignItems: "center", zIndex: 10 },
  processingContent: { backgroundColor: CAMERA_COLORS.processingCard, padding: 24, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: CAMERA_COLORS.processingBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  processingTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  processingTitle: { color: CAMERA_COLORS.text, marginTop: 0, fontSize: 18, fontWeight: "700" },
  processingSub: { color: "#A1A1AA", marginTop: 8, fontSize: 14 },

  // Review controls (after recording)
  reviewControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", paddingBottom: 20 },
  reviewButtonsOverlay: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewButtonCancel: { backgroundColor: "rgba(239,68,68,0.9)", flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  reviewButtonSend: { backgroundColor: "#4F46E5", flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, gap: 8 },
  reviewButtonText: { color: CAMERA_COLORS.text, fontWeight: "600", fontSize: 16 },

  // Legacy — kept for review-state header
  headerBadge: { flexDirection: "row", alignItems: "center", backgroundColor: CAMERA_COLORS.overlay, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
  headerText: { color: CAMERA_COLORS.text, fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  priceListBadgeActive: { backgroundColor: "rgba(16,185,129,0.15)" },
  timerBadge: { flexDirection: "row", alignItems: "center", backgroundColor: CAMERA_COLORS.overlay, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: CAMERA_COLORS.recordDot },
  timerText: { color: CAMERA_COLORS.text, fontWeight: "600", fontVariant: ["tabular-nums"] },
  controlsContainer: { alignItems: "center" },
  controls: { alignItems: "center", marginTop: 20 },
});

// Themed styles — modal elements and text mode
const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  topBar: { backgroundColor: c.background },
  centerAll: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  permissionText: { color: c.textSecondary, textAlign: "center", fontSize: 16, marginBottom: 24, lineHeight: 24 },
  permissionButton: { backgroundColor: c.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permissionButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  textModeContainer: { flex: 1, backgroundColor: c.background },
  textModeInner: { flex: 1, padding: 20, justifyContent: "center" },
  textInputContainer: { flex: 1, paddingTop: Platform.OS === "ios" ? 20 : 10 },
  textModeTitle: { color: c.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 8 },
  textModeSub: { color: c.textSecondary, fontSize: 14, marginBottom: 20 },
  documentBadge: { flexDirection: "row", alignItems: "center", backgroundColor: c.accentSubtle, padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: c.accentBorder, gap: 8 },
  documentName: { color: c.textPrimary, fontSize: 14, flex: 1, fontWeight: "500" },
  textInput: { backgroundColor: c.surface, borderRadius: 16, padding: 16, color: c.textPrimary, fontSize: 16, height: 150, borderWidth: 1, borderColor: c.border, textAlignVertical: "top", marginBottom: 20 },
  textActionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  attachButton: { backgroundColor: c.surfaceRaised, width: 50, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  sendButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: c.accent, paddingVertical: 14, borderRadius: 12, gap: 8 },
  sendButtonDisabled: { backgroundColor: c.surfaceRaised },
  sendButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  sendButtonTextDisabled: { color: c.textDisabled },
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
  modalContent: { backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "80%", padding: 24, paddingTop: 12 },
  dragHandleContainer: { alignItems: "center", paddingBottom: 12 },
  dragHandle: { width: 40, height: 4, backgroundColor: c.borderSubtle, borderRadius: 2 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: c.textPrimary, fontSize: 20, fontWeight: "bold" },
  searchInputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: c.surfaceRaised, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 50 },
  searchInput: { flex: 1, color: c.textPrimary, fontSize: 16, marginLeft: 12 },
  currencyList: { flex: 1 },
  currencyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border },
  currencyCode: { color: c.textPrimary, fontSize: 16, fontWeight: "600" },
  currencyName: { color: c.textSecondary, fontSize: 14, marginTop: 2 },
  currencySymbol: { color: c.textPrimary, fontSize: 20, fontWeight: "bold" },
  emptySearchText: { color: c.textSecondary, textAlign: "center", marginTop: 40, fontSize: 16 },
  priceListFileCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.successSubtle, borderWidth: 1, borderColor: c.success, borderRadius: 12, padding: 14, marginBottom: 16 },
  priceListFileName: { color: c.textPrimary, fontSize: 15, fontWeight: "600", flex: 1 },
  priceListActionBtn: { backgroundColor: c.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginBottom: 10, flexDirection: "row", gap: 8 },
  priceListRemoveBtn: { backgroundColor: c.errorSubtle, borderWidth: 1, borderColor: c.error },
  priceListActionBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  priceListUploadBtn: { borderWidth: 1.5, borderStyle: "dashed", borderColor: c.accentBorder, borderRadius: 16, paddingVertical: 28, alignItems: "center", backgroundColor: c.accentSubtle },
  priceListUploadText: { color: c.accentLight, fontSize: 16, fontWeight: "600", marginBottom: 4 },
  priceListUploadSub: { color: c.textDisabled, fontSize: 13 },
});
