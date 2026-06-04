import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { Sparkles, ArrowRight, PartyPopper } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

// Sparkle colors are intentional brand decoratives — keep as literals
const SPARKLES = [
  { size: 8, top: 0.12, left: 0.08, color: "#818CF8", dur: 3200, delay: 0, dist: 18 },
  { size: 6, top: 0.18, left: 0.75, color: "#A78BFA", dur: 4000, delay: 400, dist: 14 },
  { size: 10, top: 0.35, left: 0.88, color: "#38BDF8", dur: 3600, delay: 800, dist: 20 },
  { size: 7, top: 0.55, left: 0.05, color: "#818CF8", dur: 4400, delay: 200, dist: 16 },
  { size: 5, top: 0.68, left: 0.82, color: "#C4B5FD", dur: 3000, delay: 600, dist: 12 },
  { size: 9, top: 0.78, left: 0.15, color: "#A78BFA", dur: 3800, delay: 1000, dist: 22 },
  { size: 6, top: 0.25, left: 0.52, color: "#38BDF8", dur: 5000, delay: 300, dist: 15 },
  { size: 8, top: 0.88, left: 0.65, color: "#818CF8", dur: 3400, delay: 700, dist: 18 },
];

function SparkleParticle({
  size,
  top,
  left,
  color,
  dur,
  delay,
  dist,
}: (typeof SPARKLES)[0]) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: dur * 0.3 }),
          withTiming(0.3, { duration: dur * 0.7 })
        ),
        -1,
        true
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-dist, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: dur, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: height * top,
          left: width * left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, "rgba(0,0,0,0)"]}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {SPARKLES.map((s, i) => (
        <SparkleParticle key={i} {...s} />
      ))}

      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animated.View style={[styles.iconContainer, iconAnimStyle]} entering={FadeIn.duration(800)}>
            <View style={styles.iconGlow}>
              <PartyPopper color={colors.accentLight} size={64} strokeWidth={1.5} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.springify().damping(14).delay(300)}>
            <View style={styles.badgeContainer}>
              <Sparkles color={colors.accentLight} size={13} style={{ marginRight: 6 }} />
              <Text style={styles.badgeText}>Welcome to SnapQuote</Text>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.springify().damping(14).delay(450)}
            style={styles.title}
          >
            Hi {user?.displayName ? user.displayName.split(" ")[0] : "there"}!{"\n"}
            You're all set.
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.springify().damping(14).delay(600)}
            style={styles.subtitle}
          >
            We're thrilled to have you here. Let's personalize your experience by setting up your invoice profile.
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.springify().damping(14).delay(800)}
          style={styles.footer}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/setup")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Continue to Setup</Text>
            <ArrowRight color="#fff" size={20} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
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
    height: height * 0.55,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: height * 0.08,
  },
  iconContainer: {
    alignItems: "flex-start",
    marginBottom: 40,
  },
  iconGlow: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: c.accentSubtle,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.accentBorder,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: c.accentSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 24,
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
  subtitle: {
    color: c.textTertiary,
    fontSize: 16,
    lineHeight: 26,
    paddingRight: 20,
  },
  footer: {
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
  },
  primaryButton: {
    backgroundColor: c.accent,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
