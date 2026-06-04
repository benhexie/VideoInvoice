import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import {
  LogOut,
  Shield,
  ChevronRight,
  Palette,
  Smartphone,
  Sun,
  Moon,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemePreference } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

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
  const { user } = useAuth();
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const styles = createStyles(colors);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <View style={styles.avatarOuterRing}>
          <View style={styles.avatarInnerRing}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitials}>
                {getInitials(user?.displayName)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.nameText}>{user?.displayName || "SnapQuote User"}</Text>
        <Text style={styles.emailText}>{user?.email || "No Email Found"}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Free Plan</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
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
  avatarOuterRing: {
    width: 112, height: 112, borderRadius: 56,
    borderWidth: 1.5, borderColor: c.accentBorder,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  avatarInnerRing: {
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 2, borderColor: c.accent,
    justifyContent: "center", alignItems: "center",
  },
  avatarContainer: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: c.accentSubtle, justifyContent: "center", alignItems: "center",
  },
  avatarInitials: { color: c.accentLight, fontSize: 32, fontWeight: "700", letterSpacing: 1 },
  nameText: { fontSize: 22, fontWeight: "700", color: c.textPrimary, marginBottom: 4 },
  emailText: { fontSize: 15, fontWeight: "500", color: c.textTertiary, marginBottom: 12 },
  badgeContainer: {
    backgroundColor: c.accentSubtle, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: c.accentBorder,
  },
  badgeText: { color: c.accentLight, fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
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
