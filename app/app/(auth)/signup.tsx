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
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { signInWithGoogle, signInWithApple, getSocialAuthError } from "../../utils/socialAuth";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Eye,
  EyeOff,
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
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";

const { height } = Dimensions.get("window");

function GoogleIcon() {
  const Svg = require("react-native-svg").Svg;
  const Path = require("react-native-svg").Path;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <Path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
      <Path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
      <Path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </Svg>
  );
}

function AppleIcon({ color }: { color: string }) {
  const Svg = require("react-native-svg").Svg;
  const Path = require("react-native-svg").Path;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path fill={color} d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </Svg>
  );
}

// Colors passed as props so interpolateColor can be called inside the Reanimated worklet
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
  borderColorFrom,
  borderColorTo,
  bgColorFrom,
  bgColorTo,
  textColor,
  placeholderColor,
  colors,
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
  borderColorFrom: string;
  borderColorTo: string;
  bgColorFrom: string;
  bgColorTo: string;
  textColor: string;
  placeholderColor: string;
  colors: AppColors;
}) {
  const focused = useSharedValue(0);
  const s = createStyles(colors);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focused.value, [0, 1], [borderColorFrom, borderColorTo]),
    backgroundColor: interpolateColor(focused.value, [0, 1], [bgColorFrom, bgColorTo]),
  }));

  return (
    <Animated.View style={[s.inputContainer, borderStyle]}>
      <View style={s.inputIconWrap}>{icon}</View>
      <TextInput
        style={[s.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showing}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
        onFocus={() => { focused.value = withTiming(1, { duration: 200 }); }}
        onBlur={() => { focused.value = withTiming(0, { duration: 200 }); }}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={s.eyeButton} hitSlop={12}>
          {showing ? (
            <EyeOff color={placeholderColor} size={18} />
          ) : (
            <Eye color={placeholderColor} size={18} />
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { colors, resolvedTheme } = useTheme();
  const styles = createStyles(colors);

  const logoGlow = useSharedValue(0.25);
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
        withTiming(-30, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.sin) })
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

  const getHumanReadableError = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await Promise.all([
        userCredential.user.updateProfile({ displayName: fullName }),
        db().collection("users").doc(userCredential.user.uid).set({ name: fullName }, { merge: true }),
        userCredential.user.sendEmailVerification(),
      ]);
    } catch (e: any) {
      setError(getHumanReadableError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setError("");
    try {
      const credential = provider === "google"
        ? await signInWithGoogle()
        : await signInWithApple();
      if (credential.additionalUserInfo?.isNewUser) {
        router.replace("/(auth)/welcome" as any);
      }
    } catch (e: any) {
      const msg = getSocialAuthError(e);
      if (msg) setError(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  const inputProps = {
    borderColorFrom: colors.border,
    borderColorTo: colors.accent,
    bgColorFrom: colors.surface,
    bgColorTo: colors.inputFocusedBg,
    textColor: colors.textPrimary,
    placeholderColor: colors.textDisabled,
    colors,
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[colors.gradientStart, "rgba(0,0,0,0)"]}
            style={styles.topGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Animated.View
            style={[
              styles.bgOrb,
              { top: -120, right: -60, width: 260, height: 260, borderRadius: 130 },
              orbStyle,
            ]}
          />

          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={styles.header}
          >
            <Animated.View style={[styles.logoContainer, logoGlowStyle]}>
              <Image
                source={require("../../assets/images/logo-icon.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.title}>Start your{"\n"}journey</Text>
            <Text style={styles.subtitle}>Create an account to get started for free</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(180)}
            style={styles.form}
          >
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AnimatedInput
              {...inputProps}
              icon={<User color={colors.textDisabled} size={20} />}
              placeholder="Full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <AnimatedInput
              {...inputProps}
              icon={<Mail color={colors.textDisabled} size={20} />}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <AnimatedInput
              {...inputProps}
              icon={<Lock color={colors.textDisabled} size={20} />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showToggle
              showing={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
            />

            <AnimatedInput
              {...inputProps}
              icon={<Lock color={colors.textDisabled} size={20} />}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              showToggle
              showing={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((s) => !s)}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <ArrowRight color="#fff" size={20} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, !!socialLoading && styles.buttonDisabled]}
              onPress={() => handleSocialSignIn("google")}
              disabled={!!socialLoading || loading}
              activeOpacity={0.85}
            >
              {socialLoading === "google" ? (
                <ActivityIndicator color={colors.textPrimary} size="small" />
              ) : (
                <>
                  <GoogleIcon />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={[styles.socialButton, !!socialLoading && styles.buttonDisabled]}
                onPress={() => handleSocialSignIn("apple")}
                disabled={!!socialLoading || loading}
                activeOpacity={0.85}
              >
                {socialLoading === "apple" ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <>
                    <AppleIcon color={colors.textPrimary} />
                    <Text style={styles.socialButtonText}>Sign in with Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(280)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  inner: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: "center",
    overflow: "hidden",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  bgOrb: {
    position: "absolute",
    backgroundColor: "#7C3AED",
    opacity: 0.15,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: c.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 28,
    elevation: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: c.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.8,
    textAlign: "center",
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    color: c.textTertiary,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: c.errorSubtle,
    borderWidth: 1,
    borderColor: c.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: c.error,
    fontSize: 14,
    textAlign: "center",
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
  inputIconWrap: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  button: {
    backgroundColor: c.accent,
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: c.accent,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: c.border,
  },
  dividerText: {
    color: c.textDisabled,
    fontSize: 13,
    flexShrink: 0,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    marginBottom: 12,
  },
  socialButtonText: {
    color: c.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: c.textTertiary,
    fontSize: 15,
  },
  footerLink: {
    color: c.accentLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
