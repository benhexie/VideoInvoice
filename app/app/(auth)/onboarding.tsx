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
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
  translateYOffset: number;
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

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14).delay(delay)}
      style={[styles.pill, animStyle]}
    >
      <View style={styles.pillIcon}>{icon}</View>
      <Text style={styles.pillLabel}>{label}</Text>
    </Animated.View>
  );
}

function PulsingButton({ onPress }: { onPress: () => void }) {
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

  return (
    <Animated.View style={[styles.primaryButton, glowStyle]}>
      <TouchableOpacity
        style={styles.primaryButtonInner}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
        <ArrowRight color="#fff" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Animated background orbs */}
      <FloatingOrb color="#4F46E5" size={320} top={-80} left={-60} delay={0} duration={5000} distance={40} />
      <FloatingOrb color="#7C3AED" size={260} top={height * 0.3} left={width * 0.5} delay={600} duration={7000} distance={55} />
      <FloatingOrb color="#0EA5E9" size={200} top={height * 0.65} left={-40} delay={300} duration={6000} distance={35} />

      {/* Top gradient overlay */}
      <LinearGradient
        colors={["rgba(79,70,229,0.22)", "transparent"]}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.content}>
        {/* Feature pills hero */}
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.heroSection}>
          <View style={styles.pillsRow}>
            <FeaturePill
              icon={<Camera color="#818CF8" size={20} />}
              label="Snap a photo"
              delay={300}
              translateYOffset={0}
            />
            <FeaturePill
              icon={<Mic color="#A78BFA" size={20} />}
              label="Describe the job"
              delay={450}
              translateYOffset={20}
            />
          </View>
          <View style={[styles.pillsRow, { justifyContent: "center" }]}>
            <FeaturePill
              icon={<Zap color="#38BDF8" size={20} />}
              label="Invoice in seconds"
              delay={600}
              translateYOffset={-10}
            />
          </View>
        </Animated.View>

        {/* Text block */}
        <View style={styles.textContainer}>
          <Animated.View entering={FadeInDown.springify().damping(14).delay(400)}>
            <View style={styles.badgeContainer}>
              <Sparkles color="#818CF8" size={12} style={{ marginRight: 6 }} />
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

        {/* CTA buttons */}
        <Animated.View
          entering={FadeInDown.springify().damping(14).delay(820)}
          style={styles.footer}
        >
          <PulsingButton onPress={() => router.push("/(auth)/signup")} />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
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
    backgroundColor: "rgba(24,24,27,0.85)",
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.35)",
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(79,70,229,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  pillLabel: {
    color: "#E4E4E7",
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
    backgroundColor: "rgba(79,70,229,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.3)",
  },
  badgeText: {
    color: "#818CF8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#FAFAFA",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 50,
    marginBottom: 16,
    letterSpacing: -1.2,
  },
  titleHighlight: {
    color: "#818CF8",
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "400",
    marginBottom: 14,
  },
  socialProof: {
    color: "#52525B",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonInner: {
    backgroundColor: "#4F46E5",
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
    backgroundColor: "rgba(24,24,27,0.7)",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  secondaryButtonText: {
    color: "#D4D4D8",
    fontSize: 16,
    fontWeight: "600",
  },
});
