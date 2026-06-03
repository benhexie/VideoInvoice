import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

function AnimatedInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showToggle,
  onToggle,
  showing,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  showToggle?: boolean;
  onToggle?: () => void;
  showing?: boolean;
}) {
  const focused = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focused.value, [0, 1], ["#27272A", "#4F46E5"]),
    backgroundColor: interpolateColor(
      focused.value,
      [0, 1],
      ["#18181B", "#1C1C2E"]
    ),
  }));

  return (
    <Animated.View style={[styles.inputContainer, borderStyle]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#52525B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showing}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        onFocus={() => {
          focused.value = withTiming(1, { duration: 200 });
        }}
        onBlur={() => {
          focused.value = withTiming(0, { duration: 200 });
        }}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.eyeButton} hitSlop={12}>
          {showing ? (
            <EyeOff color="#52525B" size={18} />
          ) : (
            <Eye color="#52525B" size={18} />
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    (params.message as string) || ""
  );
  const router = useRouter();

  // Pulsing logo glow
  const logoGlow = useSharedValue(0.25);
  // Orb float
  const orbY = useSharedValue(0);

  useEffect(() => {
    logoGlow.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orbY.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const logoGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: logoGlow.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbY.value }],
  }));

  useEffect(() => {
    if (email || password) setSuccessMessage("");
  }, [email, password]);

  const getHumanReadableError = (code: string) => {
    switch (code) {
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setLoading(false);
        return;
      }
    } catch (e: any) {
      setError(getHumanReadableError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Decorative top section */}
          <LinearGradient
            colors={["rgba(79,70,229,0.28)", "rgba(9,9,11,0)"]}
            style={styles.topGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Animated.View
            style={[
              styles.bgOrb,
              { top: -100, left: -80, width: 280, height: 280, borderRadius: 140 },
              orbStyle,
            ]}
          />

          {/* Logo + header */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={styles.header}
          >
            <Animated.View style={[styles.logoContainer, logoGlowStyle]}>
              <Text style={styles.logoText}>SQ</Text>
            </Animated.View>
            <Text style={styles.title}>Good to see{"\n"}you again</Text>
            <Text style={styles.subtitle}>Sign in to continue to SnapQuote AI</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(180)}
            style={styles.form}
          >
            {successMessage ? (
              <View style={styles.successContainer}>
                <Sparkles color="#10B981" size={14} style={{ marginRight: 8 }} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AnimatedInput
              icon={<Mail color="#52525B" size={20} />}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <AnimatedInput
              icon={<Lock color="#52525B" size={20} />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showToggle
              showing={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <ArrowRight color="#fff" size={20} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(280)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    overflow: "hidden",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
  },
  bgOrb: {
    position: "absolute",
    backgroundColor: "#4F46E5",
    opacity: 0.15,
  },
  header: {
    marginBottom: 36,
    alignItems: "center",
  },
  logoContainer: {
    width: 68,
    height: 68,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 28,
    elevation: 10,
  },
  logoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FAFAFA",
    marginBottom: 8,
    letterSpacing: -0.8,
    textAlign: "center",
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    color: "#71717A",
    textAlign: "center",
  },
  form: {
    marginBottom: 28,
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
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FAFAFA",
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: 2,
  },
  forgotPasswordText: {
    color: "#818CF8",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#71717A",
    fontSize: 15,
  },
  footerLink: {
    color: "#818CF8",
    fontSize: 15,
    fontWeight: "700",
  },
});
