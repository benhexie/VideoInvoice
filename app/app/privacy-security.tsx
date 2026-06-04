import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated as RNAnimated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

type ModalType = "changePassword" | "deleteAccount" | null;

function PasswordField({
  placeholder,
  value,
  onChangeText,
  show,
  onToggle,
  colors,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  show: boolean;
  onToggle: () => void;
  colors: AppColors;
}) {
  const s = createStyles(colors);
  return (
    <View style={s.inputRow}>
      <Lock color={colors.textTertiary} size={18} style={{ marginRight: 12 }} />
      <TextInput
        style={s.textInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {show ? <EyeOff color={colors.textTertiary} size={18} /> : <Eye color={colors.textTertiary} size={18} />}
      </TouchableOpacity>
    </View>
  );
}

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const panY = useRef(new RNAnimated.Value(0)).current;

  const makePanResponder = (onDismiss: () => void) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: RNAnimated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 1.2) {
          onDismiss();
        } else {
          RNAnimated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    });

  const panResponderChange = useRef(makePanResponder(() => setActiveModal(null))).current;
  const panResponderDelete = useRef(makePanResponder(() => setActiveModal(null))).current;

  const sheetTransform = [{ translateY: panY.interpolate({ inputRange: [0, 500], outputRange: [0, 500], extrapolate: "clamp" }) }];

  const resetChangePasswordState = () => {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setShowCurrent(false); setShowNew(false); setShowConfirm(false);
  };
  const resetDeleteState = () => { setDeletePassword(""); setShowDeletePassword(false); };
  const openModal = (type: ModalType) => { resetChangePasswordState(); resetDeleteState(); panY.setValue(0); setActiveModal(type); };
  const closeModal = () => setActiveModal(null);

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword || !confirmPassword) { Alert.alert("Error", "Please fill in all fields."); return; }
    if (newPassword.length < 6) { Alert.alert("Error", "New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Error", "New passwords do not match."); return; }
    if (!user?.email) { Alert.alert("Error", "No user email found."); return; }
    setChangingPassword(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
      await updatePassword(user, newPassword);
      closeModal();
      Alert.alert("Success", "Your password has been updated.");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many attempts. Please try again later.");
      } else {
        Alert.alert("Error", err.message || "Failed to update password.");
      }
    } finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { Alert.alert("Error", "Please enter your password to confirm."); return; }
    if (!user?.email) { Alert.alert("Error", "No user email found."); return; }
    setDeletingAccount(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, deletePassword));
      await deleteUser(user);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        Alert.alert("Error", "Incorrect password.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many attempts. Please try again later.");
      } else {
        Alert.alert("Error", err.message || "Failed to delete account.");
      }
    } finally { setDeletingAccount(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Mail color={colors.accentLight} size={18} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email address</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user?.email || "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={() => openModal("changePassword")}>
              <View style={[styles.iconBox, { backgroundColor: colors.accentSubtle }]}>
                <Lock color={colors.accentLight} size={18} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Change Password</Text>
                <Text style={styles.actionSub}>Update your account password</Text>
              </View>
              <ChevronRight color={colors.textDisabled} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY</Text>
          <View style={styles.card}>
            <View style={styles.privacyRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.successSubtle, marginRight: 12 }]}>
                <Shield color={colors.success} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Data we store</Text>
                <Text style={styles.privacyBody}>
                  We store your invoices, template settings, company details, and uploaded files (logos, signatures, price lists) in order to provide the service. We do not sell your data to third parties.
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.privacyRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(245,158,11,0.12)", marginRight: 12 }]}>
                <Info color={colors.warning} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>AI processing</Text>
                <Text style={styles.privacyBody}>
                  Videos and text you submit are sent to our AI service to generate invoices. Media is stored in Firebase and may be deleted at any time from the Invoices tab.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.error }]}>DANGER ZONE</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => Alert.alert(
                "Delete Account",
                "This will permanently delete your account and all your data. This cannot be undone.",
                [{ text: "Cancel", style: "cancel" }, { text: "Continue", style: "destructive", onPress: () => openModal("deleteAccount") }],
              )}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.errorSubtle }]}>
                <Trash2 color={colors.error} size={18} />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={styles.actionSub}>Permanently delete your account and data</Text>
              </View>
              <ChevronRight color={colors.textDisabled} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={activeModal === "changePassword"} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
            <RNAnimated.View style={[styles.modalSheet, { transform: sheetTransform }]}>
              <View {...panResponderChange.panHandlers}>
                <View style={styles.dragHandle} />
              </View>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalSub}>Enter your current password and choose a new one.</Text>
              <PasswordField placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} colors={colors} />
              <PasswordField placeholder="New password" value={newPassword} onChangeText={setNewPassword} show={showNew} onToggle={() => setShowNew((v) => !v)} colors={colors} />
              <PasswordField placeholder="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} colors={colors} />
              <TouchableOpacity style={[styles.primaryBtn, changingPassword && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={closeModal} disabled={changingPassword}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </RNAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={activeModal === "deleteAccount"} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
            <RNAnimated.View style={[styles.modalSheet, { transform: sheetTransform }]}>
              <View {...panResponderDelete.panHandlers}>
                <View style={styles.dragHandle} />
              </View>
              <View style={styles.warningBanner}>
                <AlertTriangle color={colors.error} size={20} />
                <Text style={styles.warningText}>This action is permanent and cannot be undone. All your invoices, settings, and uploaded files will be deleted.</Text>
              </View>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalSub}>Enter your password to permanently delete your account.</Text>
              <PasswordField placeholder="Your password" value={deletePassword} onChangeText={setDeletePassword} show={showDeletePassword} onToggle={() => setShowDeletePassword((v) => !v)} colors={colors} />
              <TouchableOpacity style={[styles.primaryBtn, styles.dangerBtn, deletingAccount && { opacity: 0.7 }]} onPress={handleDeleteAccount} disabled={deletingAccount}>
                {deletingAccount ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Delete My Account</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={closeModal} disabled={deletingAccount}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </RNAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface,
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: c.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: c.textPrimary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: c.textDisabled, letterSpacing: 1.2, marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" },
  dangerCard: { borderColor: c.error },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: c.surfaceRaised,
    justifyContent: "center", alignItems: "center", marginRight: 12, flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: c.textTertiary, fontWeight: "500", marginBottom: 2 },
  infoValue: { fontSize: 15, color: c.textPrimary, fontWeight: "500" },
  actionRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, color: c.textPrimary, fontWeight: "600", marginBottom: 2 },
  actionSub: { fontSize: 13, color: c.textTertiary },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
  privacyRow: { flexDirection: "row", padding: 16 },
  privacyBody: { fontSize: 13, color: c.textTertiary, lineHeight: 19, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: Platform.OS === "ios" ? 40 : 28, paddingTop: 12,
    borderWidth: 1, borderColor: c.border,
  },
  dragHandle: { width: 40, height: 4, backgroundColor: c.borderSubtle, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: c.textPrimary, marginBottom: 6 },
  modalSub: { fontSize: 14, color: c.textTertiary, marginBottom: 24, lineHeight: 20 },
  inputRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.background,
    borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 16, height: 52, marginBottom: 12,
  },
  textInput: { flex: 1, color: c.textPrimary, fontSize: 15 },
  primaryBtn: { backgroundColor: c.accent, borderRadius: 14, height: 52, justifyContent: "center", alignItems: "center", marginTop: 8 },
  dangerBtn: { backgroundColor: c.error },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  ghostBtn: { height: 48, justifyContent: "center", alignItems: "center", marginTop: 4 },
  ghostBtnText: { color: c.textTertiary, fontSize: 15, fontWeight: "600" },
  warningBanner: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: c.errorSubtle,
    borderWidth: 1, borderColor: c.error, borderRadius: 12, padding: 14, gap: 10, marginBottom: 20,
  },
  warningText: { flex: 1, color: c.error, fontSize: 13, lineHeight: 19 },
});
