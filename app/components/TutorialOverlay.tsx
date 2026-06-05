import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

export type LayoutRect = { x: number; y: number; width: number; height: number };

type Props = {
  visible: boolean;
  onComplete: () => void;
  currencyBadgeRect?: LayoutRect;
  pricesBadgeRect?: LayoutRect;
  modeToggleRect?: LayoutRect;
  recordButtonRect?: LayoutRect;
};

type SpotlightKey =
  | "none"
  | "currencyBadge"
  | "pricesBadge"
  | "modeToggle"
  | "recordButton"
  | "invoicesTab"
  | "profileTab";

type CardPosition = "center" | "above-spotlight" | "below-spotlight";

type Step = {
  title: string;
  description: string;
  spotlightKey: SpotlightKey;
  cardPosition: CardPosition;
};

const STEPS: Step[] = [
  {
    title: "Welcome to SnapQuote!",
    description:
      "Let me give you a quick tour so you can start generating quotes right away.",
    spotlightKey: "none",
    cardPosition: "center",
  },
  {
    title: "Select Your Currency",
    description:
      "Tap here to choose the currency for your quotes. It will be used across all generated invoices.",
    spotlightKey: "currencyBadge",
    cardPosition: "below-spotlight",
  },
  {
    title: "Upload a Price List",
    description:
      "Tap Prices to upload your rate sheet (PDF, CSV, Excel, or Word). AI will use your exact rates when building quotes.",
    spotlightKey: "pricesBadge",
    cardPosition: "below-spotlight",
  },
  {
    title: "Two Ways to Capture",
    description:
      "Switch between Video and Text mode. Record a walkthrough or type a description — whichever suits the job.",
    spotlightKey: "modeToggle",
    cardPosition: "below-spotlight",
  },
  {
    title: "Tap to Record",
    description:
      "Point your camera at the space, press the button, and record for up to 60 seconds. AI handles the rest.",
    spotlightKey: "recordButton",
    cardPosition: "above-spotlight",
  },
  {
    title: "Your Quotes Live Here",
    description:
      "Every quote you generate appears in the Invoices tab. Tap any quote to edit, customise, and share it.",
    spotlightKey: "invoicesTab",
    cardPosition: "above-spotlight",
  },
  {
    title: "Manage Your Profile",
    description:
      "Edit your business details, pick invoice templates, and upgrade to Pro for unlimited quotes.",
    spotlightKey: "profileTab",
    cardPosition: "above-spotlight",
  },
  {
    title: "You're All Set!",
    description:
      "Start by tapping the Capture tab and recording your first project space.",
    spotlightKey: "none",
    cardPosition: "center",
  },
];

const ACCENT = "#4F46E5";
const OVERLAY_COLOR = "rgba(0,0,0,0.78)";
const SPOTLIGHT_PADDING = 10;
const CARD_MARGIN = 16;
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 65;

export default function TutorialOverlay({
  visible,
  onComplete,
  currencyBadgeRect,
  pricesBadgeRect,
  modeToggleRect,
  recordButtonRect,
}: Props) {
  const [step, setStep] = useState(0);
  const { width: sw, height: sh } = useWindowDimensions();

  function resolveSpotlight(key: SpotlightKey): LayoutRect | null {
    const p = SPOTLIGHT_PADDING;
    switch (key) {
      case "none":
        return null;
      case "currencyBadge":
        if (!currencyBadgeRect) return null;
        return {
          x: Math.max(0, currencyBadgeRect.x - p),
          y: Math.max(0, currencyBadgeRect.y - p),
          width: currencyBadgeRect.width + p * 2,
          height: currencyBadgeRect.height + p * 2,
        };
      case "pricesBadge":
        if (!pricesBadgeRect) return null;
        return {
          x: Math.max(0, pricesBadgeRect.x - p),
          y: Math.max(0, pricesBadgeRect.y - p),
          width: pricesBadgeRect.width + p * 2,
          height: pricesBadgeRect.height + p * 2,
        };
      case "modeToggle":
        if (!modeToggleRect) return null;
        return {
          x: Math.max(0, modeToggleRect.x - p),
          y: Math.max(0, modeToggleRect.y - p),
          width: Math.min(sw, modeToggleRect.width + p * 2),
          height: modeToggleRect.height + p * 2,
        };
      case "recordButton":
        if (!recordButtonRect) return null;
        return {
          x: Math.max(0, recordButtonRect.x - p),
          y: Math.max(0, recordButtonRect.y - p),
          width: recordButtonRect.width + p * 2,
          height: recordButtonRect.height + p * 2,
        };
      case "invoicesTab": {
        const tabY = sh - TAB_BAR_HEIGHT;
        return { x: sw / 3, y: tabY, width: sw / 3, height: TAB_BAR_HEIGHT };
      }
      case "profileTab": {
        const tabY = sh - TAB_BAR_HEIGHT;
        return { x: (sw / 3) * 2, y: tabY, width: sw / 3, height: TAB_BAR_HEIGHT };
      }
    }
  }

  const current = STEPS[step];
  const spotlight = resolveSpotlight(current.spotlightKey);

  function cardPositionStyle(): object {
    if (!spotlight || current.cardPosition === "center") {
      return { top: sh * 0.38 };
    }
    if (current.cardPosition === "above-spotlight") {
      const distFromBottom = sh - spotlight.y + CARD_MARGIN;
      return { bottom: distFromBottom };
    }
    return { top: spotlight.y + spotlight.height + CARD_MARGIN };
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Spotlight overlay (4-box technique) */}
      {spotlight ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: spotlight.y }]} />
          <View style={[styles.dim, { top: spotlight.y + spotlight.height, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { top: spotlight.y, left: 0, width: spotlight.x, height: spotlight.height }]} />
          <View style={[styles.dim, { top: spotlight.y, left: spotlight.x + spotlight.width, right: 0, height: spotlight.height }]} />
          <View
            style={[
              styles.spotlightRing,
              { top: spotlight.y - 2, left: spotlight.x - 2, width: spotlight.width + 4, height: spotlight.height + 4 },
            ]}
          />
        </View>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.dim]} pointerEvents="none" />
      )}

      {/* Tooltip card */}
      <View style={[styles.card, cardPositionStyle()]}>
        <Text style={styles.stepCount}>
          {step + 1} of {STEPS.length}
        </Text>

        <Text style={styles.cardTitle}>{current.title}</Text>
        <Text style={styles.cardDesc}>{current.description}</Text>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        {/* Navigation row: Skip (left) | Back · Next/Done (right) */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {!isLastStep && (
              <TouchableOpacity onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.skipText}>Skip tour</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerRight}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <ChevronLeft color={ACCENT} size={18} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>{isLastStep ? "Get Started" : "Next"}</Text>
              {!isLastStep && <ChevronRight color="#fff" size={18} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: OVERLAY_COLOR,
  },
  spotlightRing: {
    position: "absolute",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  card: {
    position: "absolute",
    left: CARD_MARGIN,
    right: CARD_MARGIN,
    backgroundColor: "#1E1B4B",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  stepCount: {
    color: "rgba(167,139,250,0.8)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dotActive: {
    width: 18,
    backgroundColor: ACCENT,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  skipText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "500",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  backText: {
    color: ACCENT,
    fontWeight: "600",
    fontSize: 15,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
