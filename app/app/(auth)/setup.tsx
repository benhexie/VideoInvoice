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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
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
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

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
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [companyLogo, setCompanyLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const signatureRef = useRef<any>(null);

  const handleLogoUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*", copyToCacheDirectory: true });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setCompanyLogo(result.assets[0].uri);
    } catch (error: any) {
      alert("Failed to pick logo: " + error.message);
    }
  };

  const handleSignatureUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*", copyToCacheDirectory: true });
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
    const fileRef = ref(storage, `${pathPrefix}/${user!.uid}/${Date.now()}_${filename}`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!companyName.trim()) { alert("Please enter your company name."); return; }
    setLoading(true);
    try {
      const finalLogoUrl = await uploadImageToStorage(companyLogo, "logos");
      const finalSignatureUrl = await uploadImageToStorage(signatureUrl, "signatures");
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { hasCompletedOnboarding: true, updatedAt: new Date().toISOString() }, { merge: true });
      const customizationRef = doc(db, "users", user.uid, "settings", "invoice");
      await setDoc(customizationRef, {
        template: selectedTemplate, companyName, address, phone, email,
        company_logo: finalLogoUrl, signature_url: finalSignatureUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e: any) {
      alert("Failed to save profile: " + e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={styles.headerTitle}>Customize Profile</Text>
            <Text style={styles.headerSubtitle}>Let's set up your default invoice template and business details.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>1. Choose a Template</Text>
            <View style={styles.templateGrid}>
              {TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={[styles.templateCard, isSelected && { borderColor: tmpl.color, backgroundColor: `${tmpl.color}15` }]}
                    onPress={() => setSelectedTemplate(tmpl.id)}
                  >
                    <View style={[styles.templatePreviewBox, isSelected && { borderColor: tmpl.color, borderWidth: 2 }]}>
                      <TemplatePreview type={tmpl.id} color={tmpl.color} />
                      {(tmpl as any).isPremium && (
                        <View style={styles.premiumBadge}>
                          <Crown color="#fff" size={10} />
                          <Text style={styles.premiumText}>PRO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.templateName, isSelected && { color: tmpl.color, fontWeight: "bold" }]}>
                      {tmpl.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: tmpl.color }]}>
                        <Check color="#fff" size={12} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>2. Business Details</Text>

            {[
              { icon: <Building2 color={colors.textSecondary} size={20} />, placeholder: "Company Name", value: companyName, onChange: setCompanyName, keyboard: undefined },
              { icon: <MapPin color={colors.textSecondary} size={20} />, placeholder: "Business Address", value: address, onChange: setAddress, keyboard: undefined },
              { icon: <Phone color={colors.textSecondary} size={20} />, placeholder: "Phone Number", value: phone, onChange: setPhone, keyboard: "phone-pad" as any },
              { icon: <Mail color={colors.textSecondary} size={20} />, placeholder: "Business Email", value: email, onChange: setEmail, keyboard: "email-address" as any },
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
                  autoCapitalize="none"
                />
              </View>
            ))}

            {!showSignatureCanvas && (
              <>
                <View style={{ marginTop: 16, marginBottom: 12 }}>
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

                <View style={{ marginTop: 24, marginBottom: 8 }}>
                  <Text style={styles.uploadLabel}>Signature</Text>
                  <Text style={styles.uploadSubLabel}>Upload or draw your signature for sign-offs.</Text>
                </View>
              </>
            )}

            {!showSignatureCanvas ? (
              signatureUrl ? (
                <View style={{ marginTop: 0 }}>
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
                <View style={{ flexDirection: "row", gap: 12, marginTop: 0 }}>
                  <TouchableOpacity style={[styles.logoUploadBtn, { flex: 1, marginTop: 0 }]} onPress={handleSignatureUpload} disabled={uploadingSignature}>
                    {uploadingSignature && !showSignatureCanvas ? (
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
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save & Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  headerTitle: { fontSize: 32, fontWeight: "800", color: c.textPrimary, marginBottom: 8, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: c.textSecondary, lineHeight: 24, marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: c.textPrimary, marginBottom: 16 },
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
  inputGroup: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.surface,
    borderRadius: 16, borderWidth: 1, borderColor: c.border, marginBottom: 12, height: 56,
  },
  inputIcon: { paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  input: { flex: 1, color: c.textPrimary, fontSize: 16, height: "100%" },
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
});
