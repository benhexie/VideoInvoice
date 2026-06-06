import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { CONFIG } from "../config";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

export default function PreviewScreen() {
  const { id, template } = useLocalSearchParams<{ id: string; template?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      if (!user || !id) return;
      try {
        setLoading(true);
        setError(null);

        const [settingsSnap, invoiceSnap] = await Promise.all([
          db().collection("users").doc(user.uid).collection("settings").doc("invoice").get(),
          db().collection("invoices").doc(id).get(),
        ]);

        let customization: Record<string, any> = {};
        if (settingsSnap.exists) {
          customization = settingsSnap.data() as Record<string, any>;
        }
        if (template) {
          customization = { ...customization, template };
        } else if (invoiceSnap.exists && invoiceSnap.data()!.template) {
          customization = { ...customization, template: invoiceSnap.data().template };
        }

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
          throw new Error("Failed to load invoice preview");
        }

        let html = await res.text();

        html = html.replace(
          /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/i,
          '<meta name="viewport" content="width=1024">',
        );

        setHtmlContent(html);
      } catch (e: any) {
        console.error("Error fetching preview:", e);
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, [id, user, template]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Invoice Preview</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Generating preview...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.retryBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : htmlContent ? (
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webview}
            scalesPageToFit={true}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.surfaceRaised,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: c.textPrimary,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff", // always white — renders an HTML invoice document
  },
  webview: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: c.surface,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: c.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: c.error,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: c.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
