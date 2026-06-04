import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors, { AppColors } from "@/constants/Colors";

const STORAGE_KEY = "@snapquote_theme_preference";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextType = {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  resolvedTheme: "light" | "dark";
  colors: AppColors;
};

const ThemeContext = createContext<ThemeContextType>({
  preference: "system",
  setPreference: () => {},
  resolvedTheme: "dark",
  colors: Colors.dark,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const resolvedTheme: "light" | "dark" =
    preference === "system" ? (systemScheme ?? "dark") : preference;

  const colors = Colors[resolvedTheme];

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolvedTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
