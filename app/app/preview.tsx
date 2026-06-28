import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { CONFIG } from "../config";
import { ChevronLeft, Lock } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import { useSubscription } from "../context/SubscriptionContext";

// ─── Template definitions ────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "modern",  name: "Modern",    color: "#4F46E5" },
  { id: "classic", name: "Classic",   color: "#10B981" },
  { id: "minimal", name: "Minimal",   color: "#F59E0B" },
  { id: "premium", name: "Premium",   color: "#7C3AED", isPremium: true },
  { id: "elegant", name: "Elegant",   color: "#D4AF37", isPremium: true },
  { id: "bold",    name: "Bold",      color: "#FF3366", isPremium: true },
  { id: "studio",  name: "Studio",    color: "#0F4C75", isPremium: true },
  { id: "noir",    name: "Noir",      color: "#00C2CB", isPremium: true },
  { id: "luxe",    name: "Luxe",      color: "#B8860B", isPremium: true },
];

// ─── Miniature invoice thumbnail (same logic as in invoice/[id].tsx) ─────────

const InvoiceTemplatePreview = ({ type, color }: { type: string; color: string }) => {
  const dark = "#1a1a2e";

  if (type === "studio") {
    const sidebarBg = "#0a2d47";
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#fff" }}>
        <View style={{ width: 26, backgroundColor: sidebarBg, padding: 5, justifyContent: "space-between" }}>
          <View>
            <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 5 }}>
              <Text style={{ fontSize: 7, color, fontWeight: "700" }}>A</Text>
            </View>
            <View style={{ height: 2, width: 18, backgroundColor: "#fff", borderRadius: 0.5, marginBottom: 1.5, opacity: 0.85 }} />
            <View style={{ height: 1, width: 14, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 0.5, marginBottom: 6 }} />
            <View style={{ height: 0.75, width: "90%", backgroundColor: color, opacity: 0.6, marginBottom: 5 }} />
            <View style={{ height: 1, width: 10, backgroundColor: color, opacity: 0.7, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1, width: 16, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 0.5, marginBottom: 4 }} />
            <View style={{ height: 1, width: 10, backgroundColor: color, opacity: 0.7, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: 18, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 0.5 }} />
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 5 }}>
          <View style={{ marginBottom: 4 }}>
            <View style={{ height: 1, width: "55%", backgroundColor: "#bbb", borderRadius: 0.5, marginBottom: 1.5 }} />
            <View style={{ height: 2.5, width: "70%", backgroundColor: color, borderRadius: 0.5 }} />
          </View>
          <View style={{ height: 0.5, backgroundColor: "#eee", marginBottom: 4 }} />
          <View style={{ backgroundColor: sidebarBg, paddingHorizontal: 4, paddingVertical: 2.5, borderRadius: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
            <View style={{ height: 1.5, width: "55%", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "18%", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 0.5 }} />
          </View>
          {[55, 43].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, borderBottomWidth: 0.5, borderBottomColor: "#f3f4f6" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "18%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4 }}>
            <View style={{ backgroundColor: sidebarBg, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2.5 }}>
              <Text style={{ fontSize: 5, color, fontWeight: "700" }}>$8,250</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (type === "noir") {
    return (
      <View style={{ flex: 1, backgroundColor: "#0d0d0d" }}>
        <View style={{ backgroundColor: "#080808", paddingHorizontal: 7, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#1e1e1e" }}>
          <View>
            <Text style={{ fontSize: 8, fontWeight: "700", color, letterSpacing: 2 }}>ACME</Text>
            <View style={{ height: 1, width: 28, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 0.5, marginTop: 2 }} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "rgba(255,255,255,0.07)", letterSpacing: 4 }}>INV</Text>
        </View>
        <View style={{ height: 0.75, backgroundColor: color, opacity: 0.6 }} />
        <View style={{ backgroundColor: "#0f0f0f", paddingHorizontal: 7, paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#1e1e1e" }}>
          <View style={{ height: 1, width: "40%", backgroundColor: color, opacity: 0.7, borderRadius: 0.5, marginBottom: 2 }} />
          <View style={{ height: 1.5, width: "60%", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 0.5 }} />
        </View>
        <View style={{ paddingHorizontal: 7, paddingTop: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 2.5, borderBottomWidth: 0.5, borderBottomColor: "#1e1e1e", marginBottom: 1 }}>
            <View style={{ height: 1.5, width: "50%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "18%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5 }} />
          </View>
          {[58, 44].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, borderBottomWidth: 0.5, borderBottomColor: "#1a1a1a" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "18%", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        <View style={{ backgroundColor: "#080808", flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 7, paddingVertical: 5, marginTop: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: "900", color, letterSpacing: 1 }}>$8,250</Text>
        </View>
      </View>
    );
  }

  if (type === "luxe") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 7, paddingTop: 8, paddingBottom: 6 }}>
          <View>
            <View style={{ height: 2.5, width: 38, backgroundColor: "#111", borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1, width: 26, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "100", color: "#f0f0f0", letterSpacing: 3, lineHeight: 18 }}>INV</Text>
        </View>
        <View style={{ height: 3, backgroundColor: color, marginBottom: 5 }} />
        <View style={{ flexDirection: "row", paddingHorizontal: 7, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: "#e8e4de" }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flex: 1, borderLeftWidth: i > 0 ? 0.5 : 0, borderLeftColor: "#e8e4de", paddingLeft: i > 0 ? 4 : 0 }}>
              <View style={{ height: 1, width: "55%", backgroundColor: color, opacity: 0.7, borderRadius: 0.5, marginBottom: 1.5 }} />
              <View style={{ height: 1.5, width: "75%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal: 7, paddingTop: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 3, borderBottomWidth: 1.5, borderBottomColor: color, marginBottom: 2 }}>
            <View style={{ height: 1.5, width: "50%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "18%", backgroundColor: color, opacity: 0.8, borderRadius: 0.5 }} />
          </View>
          {[58, 44].map((w, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#f0ede8" }}>
              <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
              <View style={{ height: 1.5, width: "18%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingTop: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: "700", color, letterSpacing: 0.5 }}>$8,250</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === "premium") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 3, width: 32, backgroundColor: color, borderRadius: 0.5, marginBottom: 2 }} />
            <View style={{ height: 1.5, width: 22, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
          </View>
          <Text style={{ fontSize: 7, color: "#fff", fontStyle: "italic", fontWeight: "700", letterSpacing: 1 }}>Invoice</Text>
        </View>
        <View style={{ height: 1, backgroundColor: color, opacity: 0.8 }} />
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
        <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3.5, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ height: 1.5, width: "50%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "20%", backgroundColor: color, opacity: 0.9, borderRadius: 0.5 }} />
        </View>
        {[55, 42].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 7, paddingVertical: 3.5, borderBottomWidth: 0.5, borderBottomColor: "#eee" }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ddd", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#ddd", borderRadius: 0.5 }} />
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 7, paddingTop: 5 }}>
          <View style={{ backgroundColor: dark, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 2 }}>
            <Text style={{ fontSize: 5, color, fontWeight: "700" }}>TOTAL  $8,250</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === "elegant") {
    const gold = "#c9a84c";
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 6 }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, justifyContent: "center", alignItems: "center", marginBottom: 3 }}>
            <Text style={{ fontSize: 8, color: "#fff", fontWeight: "700" }}>A</Text>
          </View>
          <View style={{ height: 2.5, width: 46, backgroundColor: color, borderRadius: 0.5, marginBottom: 1.5 }} />
          <View style={{ height: 1.5, width: 34, backgroundColor: "#bbb", borderRadius: 0.5, marginBottom: 5 }} />
          <View style={{ width: "80%", height: 1.5, backgroundColor: gold, marginBottom: 1.5 }} />
          <View style={{ width: "80%", height: 0.75, backgroundColor: gold, opacity: 0.5 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 4 }}>
          <Text style={{ fontSize: 7.5, fontStyle: "italic", color, fontWeight: "700" }}>Invoice</Text>
          <View style={{ height: 1.5, width: "30%", backgroundColor: "#ccc", borderRadius: 0.5, marginTop: 2 }} />
        </View>
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
    const boldDark = "#1f2937";
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <View style={{ height: 4.5, width: 44, backgroundColor: "#fff", borderRadius: 0.5, marginBottom: 2.5 }} />
            <View style={{ height: 1.5, width: 28, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.22)" }} />
        </View>
        <View style={{ backgroundColor: boldDark, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.1)", letterSpacing: 3 }}>INV</Text>
          <View style={{ height: 1.5, width: "38%", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 }} />
        </View>
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
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
          <Text style={{ fontSize: 9, fontWeight: "700", color }}>INVOICE</Text>
        </View>
        {[60, 46, 53].map((w, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 2.5 }}>
            <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
            <View style={{ height: 1.5, width: "20%", backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
          </View>
        ))}
      </View>
    );
  }

  if (type === "classic") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ height: 4, backgroundColor: color }} />
        {[1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
            <View style={{ flex: 2, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5, marginRight: 4 }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: "#e0e0e0", borderRadius: 0.5 }} />
          </View>
        ))}
      </View>
    );
  }

  // minimal (default)
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ height: 2, backgroundColor: color }} />
      {[54, 42, 48].map((w, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 3.5 }}>
          <View style={{ height: 1.5, width: `${w}%`, backgroundColor: "#ccc", borderRadius: 0.5 }} />
          <View style={{ height: 1.5, width: "18%", backgroundColor: "#ccc", borderRadius: 0.5 }} />
        </View>
      ))}
    </View>
  );
};

// ─── CSS injected into every HTML preview to remove surrounding whitespace ────

const FILL_CSS = `
<style id="_vi_fill">
  html,body{margin:0!important;padding:0!important;background:#fff!important;width:100%!important;}
  body>div,body>main,body>article,body>section,body>table{
    width:100%!important;max-width:100%!important;
    margin-left:0!important;margin-right:0!important;
    box-shadow:none!important;border-radius:0!important;
    box-sizing:border-box!important;
  }
</style>`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PreviewScreen() {
  const { id, template } = useLocalSearchParams<{ id: string; template?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [activeTemplate, setActiveTemplate] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: resolve starting template from route param or saved data ────────
  useEffect(() => {
    if (!user || !id) return;
    if (template) { setActiveTemplate(template as string); return; }

    async function resolve() {
      const [settingsSnap, invoiceSnap] = await Promise.all([
        db().collection("users").doc(user!.uid).collection("settings").doc("invoice").get(),
        db().collection("invoices").doc(id).get(),
      ]);
      const saved =
        (invoiceSnap.exists ? invoiceSnap.data()?.template : null) ||
        (settingsSnap.exists ? (settingsSnap.data() as any)?.template : null) ||
        "modern";
      setActiveTemplate(saved);
    }
    resolve().catch(() => setActiveTemplate("modern"));
  }, [id, user]); // only on mount

  // ── Step 2: fetch HTML whenever template is known / changes ─────────────────
  useEffect(() => {
    if (!user || !id || !activeTemplate) return;

    let cancelled = false;

    async function fetchPreview() {
      setLoading(true);
      setError(null);
      try {
        const settingsSnap = await db()
          .collection("users")
          .doc(user!.uid)
          .collection("settings")
          .doc("invoice")
          .get();

        const customization: Record<string, any> = settingsSnap.exists
          ? (settingsSnap.data() as Record<string, any>)
          : {};
        customization.template = activeTemplate;

        const token = await user!.getIdToken();
        const res = await fetch(CONFIG.api.endpoints.previewQuote(id), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(customization),
        });

        if (!res.ok) throw new Error("Failed to load invoice preview");

        let html = await res.text();

        // Replace viewport so device renders at full width
        html = html.replace(
          /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/?>/i,
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        );

        // Inject fill-patch CSS so the invoice body fills the screen
        html = html.replace(/<\/head>/i, `${FILL_CSS}</head>`);

        if (!cancelled) setHtmlContent(html);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPreview();
    return () => { cancelled = true; };
  }, [id, user, activeTemplate]);

  const handleSelectTemplate = (tmplId: string) => {
    if (tmplId === activeTemplate) return;
    setActiveTemplate(tmplId);
    if (user && id) {
      db().collection("invoices").doc(id).set({ template: tmplId }, { merge: true }).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Invoice Preview</Text>
      </View>

      {/* Invoice WebView — fills all space between header and picker */}
      <View style={styles.webviewArea}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Generating preview…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
              <Text style={styles.retryBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : htmlContent ? (
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webview}
          />
        ) : null}
      </View>

      {/* Template thumbnail strip */}
      <View style={styles.templateBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateBarContent}
        >
          {TEMPLATES.map((tmpl) => {
            const isActive = activeTemplate === tmpl.id;
            const isLocked = !!tmpl.isPremium && !isPro;
            return (
              <TouchableOpacity
                key={tmpl.id}
                style={[styles.templateCard, isActive && { borderColor: tmpl.color, borderWidth: 2 }]}
                onPress={() => {
                  if (isLocked) { router.push("/paywall"); return; }
                  handleSelectTemplate(tmpl.id);
                }}
                activeOpacity={0.75}
              >
                {/* Miniature invoice preview */}
                <View style={[styles.templateThumb, isActive && { borderColor: tmpl.color }]}>
                  <InvoiceTemplatePreview type={tmpl.id} color={tmpl.color} />

                  {/* PRO badge */}
                  {tmpl.isPremium && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}

                  {/* Lock overlay */}
                  {isLocked && (
                    <View style={styles.lockOverlay}>
                      <Lock color="#fff" size={14} />
                    </View>
                  )}

                  {/* Active checkmark */}
                  {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: tmpl.color }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.templateName, isActive && { color: tmpl.color, fontWeight: "700" }]}
                  numberOfLines={1}
                >
                  {tmpl.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (c: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.surface },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surfaceRaised,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    title: { fontSize: 18, fontWeight: "700", color: c.textPrimary },

    webviewArea: { flex: 1, backgroundColor: "#fff" },
    webview: { flex: 1 },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: c.surface,
    },
    loadingText: { marginTop: 12, fontSize: 15, color: c.textSecondary },
    errorText: { fontSize: 15, color: c.error, marginBottom: 16, textAlign: "center" },
    retryBtn: {
      backgroundColor: c.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

    // Template strip
    templateBar: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
      paddingVertical: 10,
    },
    templateBarContent: {
      paddingHorizontal: 14,
      gap: 10,
      alignItems: "flex-start",
    },
    templateCard: {
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: c.borderSubtle,
      borderRadius: 10,
      padding: 6,
      backgroundColor: c.surfaceRaised,
      width: 72,
    },
    templateThumb: {
      width: 60,
      height: 78,
      borderRadius: 5,
      overflow: "hidden",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: c.borderSubtle,
      position: "relative",
    },
    templateName: {
      marginTop: 5,
      fontSize: 10,
      fontWeight: "500",
      color: c.textSecondary,
      textAlign: "center",
      width: "100%",
    },
    proBadge: {
      position: "absolute",
      top: 3,
      left: 3,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 3,
      paddingVertical: 1,
      borderRadius: 3,
    },
    proBadgeText: { color: "#fff", fontSize: 7, fontWeight: "700" },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    checkBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: "#fff",
    },
    checkText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  });
