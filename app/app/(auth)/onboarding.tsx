import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Mic, Zap, ArrowRight, Sparkles } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

function FloatingOrb({
  color,
  size,
  top,
  left,
  delay,
  duration,
  distance,
}: {
  color: string;
  size: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
  distance: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.18,
        },
        animStyle,
      ]}
    />
  );
}

function FeaturePill({
  icon,
  label,
  delay,
  translateYOffset,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  translateYOffset: number;
  colors: AppColors;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay + 800,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + translateYOffset }],
  }));

  const s = createStyles(colors);
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14).delay(delay)}
      style={[s.pill, animStyle]}
    >
      <View style={s.pillIcon}>{icon}</View>
      <Text style={s.pillLabel}>{label}</Text>
    </Animated.View>
  );
}

function PulsingButton({ onPress, colors }: { onPress: () => void; colors: AppColors }) {
  const glow = useSharedValue(0.3);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  const s = createStyles(colors);
  return (
    <Animated.View style={[s.primaryButton, glowStyle]}>
      <TouchableOpacity
        style={s.primaryButtonInner}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={s.primaryButtonText}>Get Started</Text>
        <ArrowRight color="#fff" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <FloatingOrb color="#4F46E5" size={320} top={-80} left={-60} delay={0} duration={5000} distance={40} />
      <FloatingOrb color="#7C3AED" size={260} top={height * 0.3} left={width * 0.5} delay={600} duration={7000} distance={55} />
      <FloatingOrb color="#0EA5E9" size={200} top={height * 0.65} left={-40} delay={300} duration={6000} distance={35} />

      <LinearGradient
        colors={[colors.gradientStart, "transparent"]}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.heroSection}>
          <View style={styles.pillsRow}>
            <FeaturePill icon={<Camera color="#818CF8" size={20} />} label="Snap a photo" delay={300} translateYOffset={0} colors={colors} />
            <FeaturePill icon={<Mic color="#A78BFA" size={20} />} label="Describe the job" delay={450} translateYOffset={20} colors={colors} />
          </View>
          <View style={[styles.pillsRow, { justifyContent: "center" }]}>
            <FeaturePill icon={<Zap color="#38BDF8" size={20} />} label="Invoice in seconds" delay={600} translateYOffset={-10} colors={colors} />
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          <Animated.View entering={FadeInDown.springify().damping(14).delay(400)}>
            <View style={styles.badgeContainer}>
              <Sparkles color={colors.accentLight} size={12} style={{ marginRight: 6 }} />
              <Text style={styles.badgeText}>Powered by AI</Text>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.springify().damping(14).delay(500)}
            style={styles.title}
          >
            Invoices at the{"\n"}
            <Text style={styles.titleHighlight}>speed</Text> of thought.
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.springify().damping(14).delay(620)}
            style={styles.subtitle}
          >
            Point your camera, describe the job, and let AI generate a
            professional, ready-to-send quote in seconds.
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.springify().damping(14).delay(700)}
            style={styles.socialProof}
          >
            ✦ Trusted by freelancers everywhere
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.springify().damping(14).delay(820)}
          style={styles.footer}
        >
          <PulsingButton onPress={() => router.push("/(auth)/signup")} colors={colors} />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
    overflow: "hidden",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: height * 0.1,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    gap: 14,
    paddingBottom: 20,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-start",
    paddingHorizontal: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.accentBorder,
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.accentSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  pillLabel: {
    color: c.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  textContainer: {
    marginBottom: 32,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: c.accentSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: c.accentBorder,
  },
  badgeText: {
    color: c.accentLight,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: c.textPrimary,
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 50,
    marginBottom: 16,
    letterSpacing: -1.2,
  },
  titleHighlight: {
    color: c.accentLight,
  },
  subtitle: {
    color: c.textSecondary,
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "400",
    marginBottom: 14,
  },
  socialProof: {
    color: c.textDisabled,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonInner: {
    backgroundColor: c.accent,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.borderSubtle,
  },
  secondaryButtonText: {
    color: c.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
