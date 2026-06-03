import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, ArrowRight, RefreshCw } from "lucide-react-native";
import { auth } from "../../firebaseConfig";
import { signOut, sendEmailVerification } from "firebase/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

function RippleRing({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.9, { duration: 2100, easing: Easing.out(Easing.ease) }),
        -1
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2100, easing: Easing.out(Easing.ease) }),
        -1
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 1.5,
          borderColor: "#4F46E5",
        },
        animStyle,
      ]}
    />
  );
}

function FloatingIcon() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.iconCircle, animStyle]}>
      <Mail color="#818CF8" size={44} strokeWidth={1.5} />
    </Animated.View>
  );
}

export default function VerifyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        router.replace("/(tabs)");
      } else {
        await signOut(auth);
        router.replace({
          pathname: "/(auth)/login",
          params: { error: "Please verify your email before continuing." },
        });
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email resent! Check your inbox and spam folder.");
    } catch (e: any) {
      if (e.code === "auth/too-many-requests") {
        setError("Please wait a few minutes before requesting another email.");
      } else {
        setError(e.message || "Failed to resend email");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={["rgba(79,70,229,0.2)", "rgba(9,9,11,0)"]}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.inner}>
        {/* Animated icon with ripple rings */}
        <Animated.View entering={FadeInDown.springify().damping(14).delay(100)} style={styles.iconContainer}>
          <RippleRing delay={0} />
          <RippleRing delay={700} />
          <RippleRing delay={1400} />
          <FloatingIcon />
        </Animated.View>

        {/* Text */}
        <Animated.View entering={FadeInDown.springify().damping(14).delay(250)} style={styles.textContainer}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{"\n"}
            <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
          </Text>
          <Text style={styles.description}>
            Click the link in the email to verify your account. It may take a minute or two to arrive.
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.springify().damping(14).delay(400)} style={styles.actionContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading || resendLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>I've verified my email</Text>
                <ArrowRight color="#fff" size={20} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, resendLoading && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={loading || resendLoading}
            activeOpacity={0.85}
          >
            {resendLoading ? (
              <ActivityIndicator color="#818CF8" />
            ) : (
              <>
                <RefreshCw color="#818CF8" size={18} />
                <Text style={styles.secondaryButtonText}>Resend email</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
    height: 120,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(79,70,229,0.12)",
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FAFAFA",
    marginBottom: 14,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  emailText: {
    color: "#FAFAFA",
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    color: "#52525B",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  actionContainer: {},
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "rgba(24,24,27,0.8)",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.3)",
  },
  secondaryButtonText: {
    color: "#818CF8",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#10B981",
    fontSize: 14,
    textAlign: "center",
  },
});
