import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
} from "lucide-react-native";

const getInitials = (name?: string | null): string => {
  if (!name) return "SQ";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

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

        <Text style={styles.nameText}>
          {user?.displayName || "SnapQuote User"}
        </Text>
        <Text style={styles.emailText}>{user?.email || "No Email Found"}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Free Plan</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "rgba(79, 70, 229, 0.12)" }]}>
            <Palette color="#818CF8" size={20} />
          </View>
          <Text style={styles.menuText}>Template Customizations</Text>
          <ChevronRight color="#52525B" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/privacy-security")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
            <Shield color="#10B981" size={20} />
          </View>
          <Text style={styles.menuText}>Privacy & Security</Text>
          <ChevronRight color="#52525B" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#EF4444" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F23",
    marginHorizontal: 24,
  },
  avatarOuterRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1.5,
    borderColor: "rgba(79, 70, 229, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarInnerRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: "rgba(79, 70, 229, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#818CF8",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#71717A",
    marginBottom: 12,
  },
  badgeContainer: {
    backgroundColor: "rgba(79, 70, 229, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.3)",
  },
  badgeText: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#E4E4E7",
    fontWeight: "500",
  },
  logoutSection: {
    marginTop: "auto",
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginBottom: 90,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
