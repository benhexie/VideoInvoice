import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { auth, db, storage } from "../../firebaseConfig";
import { useRouter } from "expo-router";
import {
  LogOut,
  Shield,
  ChevronRight,
  Palette,
  Smartphone,
  Sun,
  Moon,
  Crown,
  Camera,
  Share2,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemePreference } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: (color: string) => React.ReactNode }[] = [
  { key: "system", label: "System", icon: (c) => <Smartphone color={c} size={18} /> },
  { key: "light",  label: "Light",  icon: (c) => <Sun color={c} size={18} /> },
  { key: "dark",   label: "Dark",   icon: (c) => <Moon color={c} size={18} /> },
];

const getInitials = (name?: string | null): string => {
  if (!name) return "SQ";
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
};

export default function ProfileScreen() {
  const { user, userProfile } = useAuth();
  const { isPro } = useSubscription();
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const styles = createStyles(colors);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        title: "VideoInvoice",
        message:
          "Create professional invoices from videos in seconds! Check out VideoInvoice — the AI estimator for contractors. https://videoinvoice.app",
        url: "https://videoinvoice.app",
      });
    } catch (error: any) {
      Alert.alert("Share Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library to change your profile photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    const uid = user?.uid;
    if (!uid) return;

    setUploadingPhoto(true);
    try {
      const ref = storage().ref(`profileImages/${uid}.jpg`);
      await ref.putFile(uri);
      const downloadURL = await ref.getDownloadURL();
      await db().collection("users").doc(uid).set({ photoURL: downloadURL }, { merge: true });
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? "Could not update profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto} style={styles.avatarWrapper} activeOpacity={0.85}>
          <View style={styles.avatarOuterRing}>
            <View style={styles.avatarInnerRing}>
              <View style={styles.avatarContainer}>
                {userProfile?.photoURL || user?.photoURL ? (
                  <Image
                    source={{ uri: (userProfile?.photoURL || user?.photoURL)! }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {getInitials(userProfile?.name || user?.displayName)}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.cameraButton}>
            {uploadingPhoto ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Camera color="#fff" size={14} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.nameText}>{userProfile?.name || user?.displayName || "VideoInvoice User"}</Text>
        <Text style={styles.emailText}>{user?.email || "No Email Found"}</Text>
        {isPro ? (
          <LinearGradient
            colors={["#7C3AED", "#D4AF37"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proBadgeContainer}
          >
            <Crown color="#fff" size={13} />
            <Text style={styles.proBadgeText}>Pro</Text>
          </LinearGradient>
        ) : (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Free</Text>
          </View>
        )}
      </View>

      <View style={styles.menuSection}>
        {!isPro && (
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: "#7C3AED" }]}
            onPress={() => router.push("/paywall")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(124,58,237,0.15)" }]}>
              <Crown color="#7C3AED" size={20} />
            </View>
            <Text style={styles.menuText}>Upgrade to Pro</Text>
            <ChevronRight color={colors.textDisabled} size={20} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/settings")}>
          <View style={[styles.menuIcon, { backgroundColor: colors.accentSubtle }]}>
            <Palette color={colors.accentLight} size={20} />
          </View>
          <Text style={styles.menuText}>Template Customizations</Text>
          <ChevronRight color={colors.textDisabled} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/privacy-security")}>
          <View style={[styles.menuIcon, { backgroundColor: colors.successSubtle }]}>
            <Shield color={colors.success} size={20} />
          </View>
          <Text style={styles.menuText}>Privacy & Security</Text>
          <ChevronRight color={colors.textDisabled} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(14,165,233,0.12)" }]}>
            <Share2 color="#0EA5E9" size={20} />
          </View>
          <Text style={styles.menuText}>Share VideoInvoice</Text>
          <ChevronRight color={colors.textDisabled} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.appearanceSection}>
        <Text style={styles.appearanceLabel}>Appearance</Text>
        <View style={styles.themeSelector}>
          {THEME_OPTIONS.map((opt) => {
            const isActive = preference === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.themeOption, isActive && styles.themeOptionActive]}
                onPress={() => setPreference(opt.key)}
                activeOpacity={0.8}
              >
                {opt.icon(isActive ? "#fff" : colors.textSecondary)}
                <Text style={[styles.themeOptionLabel, isActive && styles.themeOptionLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.error} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: "bold", color: c.textPrimary, letterSpacing: -0.5 },
  profileSection: {
    alignItems: "center", paddingVertical: 32,
    borderBottomWidth: 1, borderBottomColor: c.border, marginHorizontal: 24,
  },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatarOuterRing: {
    width: 112, height: 112, borderRadius: 56,
    borderWidth: 1.5, borderColor: c.accentBorder,
    justifyContent: "center", alignItems: "center",
  },
  avatarInnerRing: {
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 2, borderColor: c.accent,
    justifyContent: "center", alignItems: "center",
  },
  avatarContainer: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: c.accentSubtle, justifyContent: "center", alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarInitials: { color: c.accentLight, fontSize: 32, fontWeight: "700", letterSpacing: 1 },
  cameraButton: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: c.accent, borderWidth: 2, borderColor: c.background,
    justifyContent: "center", alignItems: "center",
  },
  nameText: { fontSize: 22, fontWeight: "700", color: c.textPrimary, marginBottom: 4 },
  emailText: { fontSize: 15, fontWeight: "500", color: c.textTertiary, marginBottom: 12 },
  badgeContainer: {
    backgroundColor: c.accentSubtle, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: c.accentBorder,
  },
  badgeText: { color: c.accentLight, fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  proBadgeContainer: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14,
  },
  proBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  menuSection: { paddingHorizontal: 24, paddingTop: 24 },
  menuItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.surface,
    padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: c.textPrimary, fontWeight: "500" },
  appearanceSection: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  appearanceLabel: { fontSize: 13, fontWeight: "600", color: c.textSecondary, letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase" },
  themeSelector: { flexDirection: "row", backgroundColor: c.surfaceRaised, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 4, gap: 4 },
  themeOption: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, gap: 4 },
  themeOptionActive: { backgroundColor: c.accent },
  themeOptionLabel: { fontSize: 12, fontWeight: "600", color: c.textSecondary },
  themeOptionLabelActive: { color: "#fff" },
  logoutSection: { paddingHorizontal: 24, paddingBottom: 16 },
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: c.errorSubtle, paddingVertical: 16, borderRadius: 16,
    borderWidth: 1, borderColor: c.error, gap: 8,
  },
  logoutText: { color: c.error, fontSize: 16, fontWeight: "600" },
});
