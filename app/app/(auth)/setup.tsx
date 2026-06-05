import React, { useState, useRef, useMemo } from "react";
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
  StyleSheet,
  Modal,
  FlatList,
  PanResponder,
  Animated as RNAnimated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebaseConfig";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
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
  Lock,
  ChevronLeft,
  ChevronDown,
  Search,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import { useSubscription } from "../../context/SubscriptionContext";
import COUNTRIES from "../../utils/countries";

type Country = { name: string; flag: string; code: string; dial_code: string };

const TOTAL_STEPS = 3;

const THEME_COLORS = [
  "#4F46E5", "#7C3AED", "#EC4899", "#FF3366",
  "#F97316", "#F59E0B", "#10B981", "#14B8A6",
  "#0EA5E9", "#64748B",
];

const TEMPLATES = [
  { id: "premium", name: "Premium", color: "#7C3AED", isPremium: true },
  { id: "elegant", name: "Elegant", color: "#D4AF37", isPremium: true },
  { id: "bold", name: "Bold", color: "#FF3366", isPremium: true },
  { id: "modern", name: "Modern", color: "#4F46E5" },
  { id: "classic", name: "Classic", color: "#10B981" },
  { id: "minimal", name: "Minimalist", color: "#F59E0B" },
];

// Template previews intentionally use literal paper/document colors
const TemplatePreview = ({ type, color }: { type: string; color: string }) => {
  if (type === "premium") {
    return (
      <View style={tpStyles.container}>
        <View style={{ height: 16, width: "100%", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: "#18181B" }} />
        <View style={tpStyles.content}>
          <View style={[tpStyles.row, { marginTop: -4 }]}>
            <View style={[tpStyles.block, { width: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e4e4e7" }]} />
            <View style={[tpStyles.block, { width: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e4e4e7" }]} />
          </View>
          <View style={[tpStyles.line, { marginTop: 12 }]} />
          <View style={tpStyles.line} />
          <View style={[tpStyles.row, { marginTop: 8, justifyContent: "flex-end" }]}>
            <View style={[tpStyles.block, { width: 25, backgroundColor: "#18181B", height: 12, borderRadius: 2 }]} />
          </View>
        </View>
      </View>
    );
  }
  if (type === "elegant") {
    return (
      <View style={tpStyles.container}>
        <View style={{ height: 4, width: "100%", backgroundColor: color }} />
        <View style={tpStyles.content}>
          <View style={tpStyles.row}>
            <View style={[tpStyles.block, { width: 20, height: 10 }]} />
            <View style={[tpStyles.block, { width: 30 }]} />
          </View>
          <View style={[tpStyles.line, { marginTop: 12, height: 1, backgroundColor: "#d4d4d8" }]} />
          <View style={[tpStyles.row, { marginTop: 8 }]}>
            <View style={tpStyles.block} />
            <View style={tpStyles.block} />
          </View>
          <View style={[tpStyles.line, { marginTop: 12, height: 1, backgroundColor: "#d4d4d8" }]} />
          <View style={[tpStyles.row, { marginTop: 8, justifyContent: "flex-end" }]}>
            <View style={[tpStyles.block, { width: 25 }]} />
          </View>
          <View style={{ height: 2, width: "100%", backgroundColor: "#18181B", position: "absolute", bottom: 4, left: 8 }} />
        </View>
      </View>
    );
  }
  if (type === "bold") {
    return (
      <View style={tpStyles.container}>
        <View style={{ flexDirection: "row", height: "100%" }}>
          <View style={{ width: "30%", backgroundColor: color, height: "100%" }} />
          <View style={{ width: "70%", padding: 8 }}>
            <View style={[tpStyles.row, { marginTop: 4 }]}>
              <View style={tpStyles.block} />
              <View style={tpStyles.block} />
            </View>
            <View style={[tpStyles.line, { marginTop: 12 }]} />
            <View style={tpStyles.line} />
            <View style={[tpStyles.block, { width: "100%", height: 16, backgroundColor: "#f4f4f5", marginTop: 8, borderRadius: 2 }]} />
          </View>
        </View>
      </View>
    );
  }
  if (type === "modern") {
    return (
      <View style={tpStyles.container}>
        <View style={[tpStyles.headerModern, { backgroundColor: color }]} />
        <View style={tpStyles.content}>
          <View style={tpStyles.row}>
            <View style={tpStyles.block} />
            <View style={[tpStyles.block, { width: 30 }]} />
          </View>
          <View style={[tpStyles.line, { marginTop: 8 }]} />
          <View style={tpStyles.line} />
          <View style={[tpStyles.row, { marginTop: 8, justifyContent: "flex-end" }]}>
            <View style={[tpStyles.block, { width: 25, backgroundColor: color }]} />
          </View>
        </View>
      </View>
    );
  }
  if (type === "classic") {
    return (
      <View style={tpStyles.container}>
        <View style={tpStyles.content}>
          <View style={[tpStyles.block, { alignSelf: "center", width: 40, height: 8, backgroundColor: color }]} />
          <View style={[tpStyles.line, { marginTop: 4, height: 1 }]} />
          <View style={[tpStyles.row, { marginTop: 8 }]}>
            <View style={tpStyles.block} />
          </View>
          <View style={[tpStyles.line, { marginTop: 8, height: 12, backgroundColor: "#e4e4e7", borderWidth: 1, borderColor: "#d4d4d8" }]} />
          <View style={[tpStyles.line, { height: 12, backgroundColor: "#fafafa", borderWidth: 1, borderColor: "#d4d4d8" }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={tpStyles.container}>
      <View style={tpStyles.content}>
        <View style={[tpStyles.block, { width: 20, height: 10, borderRadius: 2 }]} />
        <View style={[tpStyles.block, { width: 30, marginTop: 4, opacity: 0.5 }]} />
        <View style={[tpStyles.line, { marginTop: 12, opacity: 0.3 }]} />
        <View style={[tpStyles.line, { opacity: 0.3 }]} />
        <View style={[tpStyles.line, { opacity: 0.3 }]} />
        <View style={[tpStyles.block, { width: 25, marginTop: 8, alignSelf: "flex-end", backgroundColor: color, opacity: 0.8 }]} />
      </View>
    </View>
  );
};

// Static styles for template previews — always use paper/document colors regardless of app theme
const tpStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerModern: { height: 16, width: "100%" },
  content: { padding: 8, flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  block: { height: 8, width: 20, backgroundColor: "#e4e4e7", borderRadius: 1 },
  line: { height: 2, width: "100%", backgroundColor: "#f4f4f5", marginTop: 4, borderRadius: 1 },
});

export default function SetupScreen() {
  const { user, userProfile } = useAuth();
  const { isPro } = useSubscription();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[3].id);
  const [themeColor, setThemeColor] = useState(TEMPLATES[3].color);
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === "US") ?? COUNTRIES[0]
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [email, setEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const signatureRef = useRef<any>(null);
  const pickerPanY = useRef(new RNAnimated.Value(0)).current;
  const pickerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: RNAnimated.event([null, { dy: pickerPanY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.2) {
          setShowCountryPicker(false);
          pickerPanY.setValue(0);
        } else {
          RNAnimated.spring(pickerPanY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const filteredCountries = useMemo(
    () => COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial_code.includes(countrySearch)
    ),
    [countrySearch]
  );

  const handlePhoneChange = (value: string) => {
    if (!value.startsWith("+")) { setPhone(value); return; }
    // Sort longest dial code first to avoid +1 matching before +1268 etc.
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial_code.length - a.dial_code.length)
      .find((c) => value.startsWith(c.dial_code));
    if (match) {
      setSelectedCountry(match);
      setPhone(value.slice(match.dial_code.length).trimStart());
    } else {
      setPhone(value.slice(1));
    }
  };

  const handleLogoUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setCompanyLogo(result.assets[0].uri);
    } catch (error: any) {
      alert("Failed to pick logo: " + error.message);
    }
  };

  const handleSignatureUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setSignatureUrl(result.assets[0].uri);
    } catch (error: any) {
      alert("Failed to pick signature: " + error.message);
    }
  };

  const handleSignatureOK = (signature: string) => {
    setShowSignatureCanvas(false);
    setSignatureUrl(signature);
  };

  const uploadImageToStorage = async (uri: string, pathPrefix: string): Promise<string> => {
    if (!uri || uri.startsWith("http")) return uri;
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError("Network request failed"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const isDataUri = uri.startsWith("data:");
    const filename = isDataUri ? "drawn.png" : uri.split("/").pop() || "upload.jpg";
    const fileRef = storage().ref(`${pathPrefix}/${user!.uid}/${Date.now()}_${filename}`);
    await fileRef.put(blob);
    return await fileRef.getDownloadURL();
  };

  const handleNext = () => {
    if (step === 2 && !companyName.trim()) {
      alert("Please enter your company name.");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSave = async () => {
    if (!user) return;
    if (!companyName.trim()) { alert("Please enter your company name."); return; }
    setLoading(true);
    try {
      const finalLogoUrl = await uploadImageToStorage(companyLogo, "logos");
      const finalSignatureUrl = await uploadImageToStorage(signatureUrl, "signatures");
      const userRef = db().collection("users").doc(user.uid);
      await userRef.set({
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      const customizationRef = db().collection("users").doc(user.uid).collection("settings").doc("invoice");
      await customizationRef.set({
        template: selectedTemplate, themeColor, companyName, address,
        phone: phone ? `${selectedCountry.dial_code} ${phone}` : "",
        email,
        company_logo: finalLogoUrl, signature_url: finalSignatureUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e: any) {
      alert("Failed to save profile: " + e.message);
      setLoading(false);
    }
  };

  const STEP_TITLES = ["Choose a Template", "Your Details", "Branding"];
  const STEP_SUBTITLES = [
    "Pick a style for your invoices. You can change this later.",
    "Add your business info to appear on every invoice.",
    "Upload a logo and signature for a professional finish.",
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Progress header */}
      <View style={styles.progressHeader}>
        <TouchableOpacity
          style={[styles.backBtn, step === 1 && { opacity: 0 }]}
          onPress={handleBack}
          disabled={step === 1}
        >
          <ChevronLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>

        <View style={styles.progressBarRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < step ? styles.progressSegmentFilled : styles.progressSegmentEmpty,
                i === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                i === TOTAL_STEPS - 1 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
              ]}
            />
          ))}
        </View>

        <Text style={styles.stepLabel}>{step}/{TOTAL_STEPS}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <Animated.View entering={FadeInDown.duration(400)} key={`step-header-${step}`}>
            <Text style={styles.headerTitle}>{STEP_TITLES[step - 1]}</Text>
            <Text style={styles.headerSubtitle}>{STEP_SUBTITLES[step - 1]}</Text>
          </Animated.View>

          {step === 1 && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={styles.templateGrid}>
                {TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  const activeColor = isSelected ? themeColor : tmpl.color;
                  return (
                    <TouchableOpacity
                      key={tmpl.id}
                      style={[styles.templateCard, isSelected && { borderColor: themeColor, backgroundColor: `${themeColor}15` }]}
                      onPress={() => {
                        if ((tmpl as any).isPremium && !isPro) {
                          router.push("/paywall");
                          return;
                        }
                        setSelectedTemplate(tmpl.id);
                        setThemeColor(tmpl.color);
                      }}
                    >
                      <View style={[styles.templatePreviewBox, isSelected && { borderColor: themeColor, borderWidth: 2 }]}>
                        <TemplatePreview type={tmpl.id} color={activeColor} />
                        {(tmpl as any).isPremium && (
                          <View style={styles.premiumBadge}>
                            <Crown color="#fff" size={10} />
                            <Text style={styles.premiumText}>PRO</Text>
                          </View>
                        )}
                        {(tmpl as any).isPremium && !isPro && (
                          <View style={styles.lockOverlay}>
                            <Lock color="#fff" size={20} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.templateName, isSelected && { color: themeColor, fontWeight: "bold" }]}>
                        {tmpl.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: themeColor }]}>
                          <Check color="#fff" size={12} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.colorLabel}>Theme Color</Text>
              <View style={styles.colorRow}>
                {THEME_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorSwatch, { backgroundColor: c }, themeColor === c && styles.colorSwatchSelected]}
                    onPress={() => setThemeColor(c)}
                  >
                    {themeColor === c && <Check color="#fff" size={13} strokeWidth={3} />}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              {[
                { icon: <Building2 color={colors.textSecondary} size={20} />, placeholder: "Company Name *", value: companyName, onChange: setCompanyName, keyboard: undefined, capitalize: "none" as any },
                { icon: <MapPin color={colors.textSecondary} size={20} />, placeholder: "Business Address", value: address, onChange: setAddress, keyboard: undefined, capitalize: "none" as any },
              ].map((field, i) => (
                <View key={i} style={styles.inputGroup}>
                  <View style={styles.inputIcon}>{field.icon}</View>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={field.value}
                    onChangeText={field.onChange}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.capitalize}
                  />
                </View>
              ))}

              {/* Phone with dial code picker */}
              <View style={styles.inputGroup}>
                <TouchableOpacity style={styles.dialCodeBtn} onPress={() => { setCountrySearch(""); setShowCountryPicker(true); }}>
                  <Text style={styles.dialFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.dialCode}>{selectedCountry.dial_code}</Text>
                  <ChevronDown color={colors.textTertiary} size={14} />
                </TouchableOpacity>
                <View style={styles.dialDivider} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              {/* Company email */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}><Mail color={colors.textSecondary} size={20} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="Business Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              {!showSignatureCanvas && (
                <>
                  <View style={styles.uploadLabelGroup}>
                    <Text style={styles.uploadLabel}>Business Logo</Text>
                    <Text style={styles.uploadSubLabel}>Add your company logo to display on invoices.</Text>
                  </View>
                  <TouchableOpacity style={styles.logoUploadBtn} onPress={handleLogoUpload} disabled={uploadingLogo}>
                    {uploadingLogo ? (
                      <ActivityIndicator color={colors.accent} size="small" />
                    ) : companyLogo ? (
                      <Image source={{ uri: companyLogo }} style={{ width: 100, height: 100, resizeMode: "contain" }} />
                    ) : (
                      <>
                        <ImageIcon color={colors.accent} size={24} style={{ marginRight: 8 }} />
                        <Text style={styles.logoUploadText}>Upload Business Logo (Optional)</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.uploadLabelGroup, { marginTop: 24 }]}>
                    <Text style={styles.uploadLabel}>Signature</Text>
                    <Text style={styles.uploadSubLabel}>Upload or draw your signature for sign-offs.</Text>
                  </View>
                </>
              )}

              {!showSignatureCanvas ? (
                signatureUrl ? (
                  <View>
                    <TouchableOpacity
                      style={[styles.logoUploadBtn, { height: 120, backgroundColor: "#FFFFFF", borderColor: "#E4E4E7" }]}
                      onPress={() => setShowSignatureCanvas(true)}
                      disabled={uploadingSignature}
                    >
                      {uploadingSignature ? (
                        <ActivityIndicator color={colors.accent} size="small" />
                      ) : (
                        <Image source={{ uri: signatureUrl }} style={{ width: "100%", height: 100, resizeMode: "contain" }} />
                      )}
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                      <TouchableOpacity style={[styles.logoUploadBtn, { flex: 1, marginTop: 0, paddingVertical: 12 }]} onPress={handleSignatureUpload} disabled={uploadingSignature}>
                        <ImageIcon color={colors.accent} size={16} style={{ marginRight: 8 }} />
                        <Text style={[styles.logoUploadText, { fontSize: 12 }]}>Upload New</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.logoUploadBtn, { flex: 1, marginTop: 0, paddingVertical: 12 }]} onPress={() => setShowSignatureCanvas(true)} disabled={uploadingSignature}>
                        <PenTool color={colors.accent} size={16} style={{ marginRight: 8 }} />
                        <Text style={[styles.logoUploadText, { fontSize: 12 }]}>Draw New</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity style={[styles.logoUploadBtn, { flex: 1, marginTop: 0 }]} onPress={handleSignatureUpload} disabled={uploadingSignature}>
                      {uploadingSignature ? (
                        <ActivityIndicator color={colors.accent} size="small" />
                      ) : (
                        <>
                          <ImageIcon color={colors.accent} size={20} style={{ marginRight: 8 }} />
                          <Text style={[styles.logoUploadText, { fontSize: 12 }]}>Upload Signature</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.logoUploadBtn, { flex: 1, marginTop: 0 }]} onPress={() => setShowSignatureCanvas(true)} disabled={uploadingSignature}>
                      <PenTool color={colors.accent} size={20} style={{ marginRight: 8 }} />
                      <Text style={[styles.logoUploadText, { fontSize: 12 }]}>Draw Signature</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 16 }}>
                  <View style={styles.signatureCanvas}>
                    <View style={styles.signatureCanvasHeader}>
                      <Text style={styles.signatureCanvasHint}>Draw your signature below</Text>
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
                    <View style={styles.signatureCanvasFooter}>
                      <TouchableOpacity
                        onPress={() => { setShowSignatureCanvas(false); setScrollEnabled(true); }}
                        style={styles.sigBtnCancel}
                      >
                        <Text style={styles.sigBtnCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()} style={styles.sigBtnClear}>
                        <Text style={styles.sigBtnClearText}>Clear</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => signatureRef.current?.readSignature()} style={styles.sigBtnSave}>
                        <Text style={styles.sigBtnSaveText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={step < TOTAL_STEPS ? handleNext : handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>{step < TOTAL_STEPS ? "Continue" : "Save & Continue"}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Country dial code picker */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowCountryPicker(false); pickerPanY.setValue(0); }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.pickerOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => { setShowCountryPicker(false); pickerPanY.setValue(0); }} />
            <RNAnimated.View
              style={[styles.pickerSheet, { transform: [{ translateY: pickerPanY.interpolate({ inputRange: [0, 500], outputRange: [0, 500], extrapolate: "clamp" }) }] }]}
            >
              <View {...pickerPanResponder.panHandlers}>
                <View style={styles.pickerHandle} />
              </View>
              <Text style={styles.pickerTitle}>Select Country</Text>
              <View style={styles.pickerSearchRow}>
                <Search color={colors.textTertiary} size={16} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search country or code…"
                  placeholderTextColor={colors.textDisabled}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, selectedCountry.code === item.code && styles.pickerItemSelected]}
                    onPress={() => { setSelectedCountry(item); setShowCountryPicker(false); pickerPanY.setValue(0); }}
                  >
                    <Text style={styles.pickerItemFlag}>{item.flag}</Text>
                    <Text style={styles.pickerItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.pickerItemDial}>{item.dial_code}</Text>
                    {selectedCountry.code === item.code && <Check color={colors.accent} size={16} />}
                  </TouchableOpacity>
                )}
              />
            </RNAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}


const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  progressHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: c.border, flexShrink: 0,
  },
  progressBarRow: { flex: 1, flexDirection: "row", gap: 4, height: 6 },
  progressSegment: { flex: 1, borderRadius: 3 },
  progressSegmentFilled: { backgroundColor: c.accent },
  progressSegmentEmpty: { backgroundColor: c.border },
  stepLabel: { fontSize: 13, fontWeight: "600", color: c.textTertiary, minWidth: 28, textAlign: "right" },
  scrollContent: { padding: 24, paddingBottom: 40 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: c.textPrimary, marginBottom: 8, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: c.textSecondary, lineHeight: 22, marginBottom: 28 },
  templateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  templateCard: {
    width: "48%", backgroundColor: c.surface, borderWidth: 2, borderColor: c.border,
    borderRadius: 16, padding: 12, alignItems: "center", position: "relative",
  },
  templatePreviewBox: {
    width: "100%", height: 100, borderRadius: 8, marginBottom: 12,
    backgroundColor: c.surfaceRaised, overflow: "hidden", borderWidth: 1, borderColor: c.borderSubtle,
  },
  templateName: { color: c.textSecondary, fontSize: 13, fontWeight: "500" },
  checkBadge: {
    position: "absolute", top: -6, right: -6, width: 20, height: 20,
    borderRadius: 10, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: c.background,
  },
  premiumBadge: {
    position: "absolute", top: 4, left: 4, backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, gap: 2,
  },
  premiumText: { color: "#fff", fontSize: 8, fontWeight: "bold" },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center", borderRadius: 8,
  },
  colorLabel: { fontSize: 15, fontWeight: "600", color: c.textPrimary, marginTop: 24, marginBottom: 12 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorSwatch: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
  colorSwatchSelected: {
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    transform: [{ scale: 1.15 }],
  },
  inputGroup: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.surface,
    borderRadius: 16, borderWidth: 1, borderColor: c.border, marginBottom: 12, height: 56,
  },
  inputIcon: { paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  input: { flex: 1, color: c.textPrimary, fontSize: 16, height: "100%" },
  dialCodeBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingLeft: 14, paddingRight: 10, height: "100%",
  },
  dialFlag: { fontSize: 20 },
  dialCode: { fontSize: 14, fontWeight: "600", color: c.textPrimary },
  dialDivider: { width: 1, height: 28, backgroundColor: c.border },
  uploadLabelGroup: { marginBottom: 8 },
  uploadLabel: { fontSize: 16, fontWeight: "600", color: c.textPrimary },
  uploadSubLabel: { fontSize: 13, color: c.textSecondary, marginTop: 4 },
  logoUploadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: c.accentSubtle, borderWidth: 1, borderColor: c.accentBorder,
    borderStyle: "dashed", borderRadius: 16, paddingVertical: 16, marginTop: 8,
  },
  logoUploadText: { color: c.accentLight, fontSize: 15, fontWeight: "600" },
  signatureCanvas: {
    height: 260, backgroundColor: c.surface, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: c.border,
  },
  signatureCanvasHeader: {
    padding: 12, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surface,
  },
  signatureCanvasHint: { color: c.textSecondary, fontSize: 13, fontWeight: "500", textAlign: "center" },
  signatureCanvasFooter: {
    flexDirection: "row", padding: 12, backgroundColor: c.surface,
    borderTopWidth: 1, borderTopColor: c.border, justifyContent: "flex-end", gap: 12,
  },
  sigBtnCancel: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
    borderWidth: 1, borderColor: c.borderSubtle,
  },
  sigBtnCancelText: { color: c.textSecondary, fontWeight: "600" },
  sigBtnClear: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8,
    backgroundColor: c.surfaceRaised, borderWidth: 1, borderColor: c.borderSubtle,
  },
  sigBtnClearText: { color: c.textPrimary, fontWeight: "600" },
  sigBtnSave: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: c.accent },
  sigBtnSaveText: { color: "#fff", fontWeight: "600" },
  footer: {
    padding: 24, paddingBottom: Platform.OS === "ios" ? 10 : 24,
    borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.background,
  },
  saveBtn: { backgroundColor: c.accent, borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  pickerOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
  pickerSheet: {
    backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 40 : 24, paddingTop: 12,
    borderWidth: 1, borderColor: c.border, maxHeight: "80%",
  },
  pickerHandle: { width: 40, height: 4, backgroundColor: c.borderSubtle, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  pickerTitle: { fontSize: 17, fontWeight: "700", color: c.textPrimary, marginBottom: 12 },
  pickerSearchRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.background,
    borderRadius: 12, borderWidth: 1, borderColor: c.border,
    paddingHorizontal: 12, height: 44, marginBottom: 12,
  },
  pickerSearchInput: { flex: 1, color: c.textPrimary, fontSize: 15 },
  pickerItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12,
    paddingHorizontal: 4, gap: 10, borderBottomWidth: 1, borderBottomColor: c.borderSubtle,
  },
  pickerItemSelected: { backgroundColor: c.accentSubtle },
  pickerItemFlag: { fontSize: 22, width: 32 },
  pickerItemName: { flex: 1, fontSize: 15, color: c.textPrimary },
  pickerItemDial: { fontSize: 14, color: c.textTertiary, fontWeight: "600" },
});
