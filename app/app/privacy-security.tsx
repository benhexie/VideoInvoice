import React, { useState } from "react";
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

type ModalType = "changePassword" | "deleteAccount" | null;

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const resetChangePasswordState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const resetDeleteState = () => {
    setDeletePassword("");
    setShowDeletePassword(false);
  };

  const openModal = (type: ModalType) => {
    resetChangePasswordState();
    resetDeleteState();
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (!user?.email) {
      Alert.alert("Error", "No user email found.");
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      closeModal();
      Alert.alert("Success", "Your password has been updated.");
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many attempts. Please try again later.");
      } else {
        Alert.alert("Error", err.message || "Failed to update password.");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert("Error", "Please enter your password to confirm.");
      return;
    }
    if (!user?.email) {
      Alert.alert("Error", "No user email found.");
      return;
    }

    setDeletingAccount(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        deletePassword,
      );
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      // Auth state listener in _layout.tsx will redirect to onboarding
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        Alert.alert("Error", "Incorrect password.");
      } else if (code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many attempts. Please try again later.");
      } else {
        Alert.alert("Error", err.message || "Failed to delete account.");
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Mail color="#818CF8" size={18} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email address</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {user?.email || "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => openModal("changePassword")}
            >
              <View style={[styles.iconBox, { backgroundColor: "rgba(79, 70, 229, 0.12)" }]}>
                <Lock color="#818CF8" size={18} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Change Password</Text>
                <Text style={styles.actionSub}>
                  Update your account password
                </Text>
              </View>
              <ChevronRight color="#52525B" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY</Text>
          <View style={styles.card}>
            <View style={styles.privacyRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.12)", marginRight: 12 }]}>
                <Shield color="#10B981" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Data we store</Text>
                <Text style={styles.privacyBody}>
                  We store your invoices, template settings, company details,
                  and uploaded files (logos, signatures, price lists) in order
                  to provide the service. We do not sell your data to third
                  parties.
                </Text>
              </View>
            </View>

            <View style={[styles.divider]} />

            <View style={styles.privacyRow}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.12)", marginRight: 12 }]}>
                <Info color="#F59E0B" size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>AI processing</Text>
                <Text style={styles.privacyBody}>
                  Videos and text you submit are sent to our AI service to
                  generate invoices. Media is stored in Firebase and may be
                  deleted at any time from the Invoices tab.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: "#EF4444" }]}>
            DANGER ZONE
          </Text>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() =>
                Alert.alert(
                  "Delete Account",
                  "This will permanently delete your account and all your data. This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Continue",
                      style: "destructive",
                      onPress: () => openModal("deleteAccount"),
                    },
                  ],
                )
              }
            >
              <View style={[styles.iconBox, { backgroundColor: "rgba(239, 68, 68, 0.12)" }]}>
                <Trash2 color="#EF4444" size={18} />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: "#EF4444" }]}>
                  Delete Account
                </Text>
                <Text style={styles.actionSub}>
                  Permanently delete your account and data
                </Text>
              </View>
              <ChevronRight color="#52525B" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={activeModal === "changePassword"}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeModal}
            />
            <View style={styles.modalSheet}>
              <View style={styles.dragHandle} />
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalSub}>
                Enter your current password and choose a new one.
              </Text>

              <PasswordField
                placeholder="Current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
              />
              <PasswordField
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
              />
              <PasswordField
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  changingPassword && { opacity: 0.7 },
                ]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={closeModal}
                disabled={changingPassword}
              >
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={activeModal === "deleteAccount"}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeModal}
            />
            <View style={styles.modalSheet}>
              <View style={styles.dragHandle} />

              <View style={styles.warningBanner}>
                <AlertTriangle color="#EF4444" size={20} />
                <Text style={styles.warningText}>
                  This action is permanent and cannot be undone. All your
                  invoices, settings, and uploaded files will be deleted.
                </Text>
              </View>

              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalSub}>
                Enter your password to permanently delete your account.
              </Text>

              <PasswordField
                placeholder="Your password"
                value={deletePassword}
                onChangeText={setDeletePassword}
                show={showDeletePassword}
                onToggle={() => setShowDeletePassword((v) => !v)}
              />

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  styles.dangerBtn,
                  deletingAccount && { opacity: 0.7 },
                ]}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Delete My Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={closeModal}
                disabled={deletingAccount}
              >
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function PasswordField({
  placeholder,
  value,
  onChangeText,
  show,
  onToggle,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.inputRow}>
      <Lock color="#71717A" size={18} style={{ marginRight: 12 }} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#52525B"
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {show ? (
          <EyeOff color="#71717A" size={18} />
        ) : (
          <Eye color="#71717A" size={18} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#52525B",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272A",
    overflow: "hidden",
  },
  dangerCard: {
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#71717A",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#F4F4F5",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    color: "#F4F4F5",
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 13,
    color: "#71717A",
  },
  divider: {
    height: 1,
    backgroundColor: "#27272A",
    marginHorizontal: 16,
  },
  privacyRow: {
    flexDirection: "row",
    padding: 16,
  },
  privacyBody: {
    fontSize: 13,
    color: "#71717A",
    lineHeight: 19,
    marginTop: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#3F3F46",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 14,
    color: "#71717A",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09090B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  dangerBtn: {
    backgroundColor: "#DC2626",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  ghostBtn: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  ghostBtnText: {
    color: "#71717A",
    fontSize: 15,
    fontWeight: "600",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    color: "#FCA5A5",
    fontSize: 13,
    lineHeight: 19,
  },
});
