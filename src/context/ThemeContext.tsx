import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type ThemeMode = "light" | "dark";

type ThemePalette = {
	background: string;
	surface: string;
	surfaceAlt: string;
	text: string;
	mutedText: string;
	border: string;
	accent: string;
	accentStrong: string;
	danger: string;
	onAccent: string;
};

type ThemeContextValue = {
	theme: ThemeMode;
	setTheme: (nextTheme: ThemeMode) => Promise<void>;
	toggleTheme: () => Promise<void>;
	isReady: boolean;
	colors: ThemePalette;
};

export const THEME_STORAGE_KEY = "APP_THEME_MODE";

const lightColors: ThemePalette = {
	background: "#f5f5f5",
	surface: "#ffffff",
	surfaceAlt: "#f0f0f0",
	text: "#1c1c1c",
	mutedText: "#666666",
	border: "#e1e1e1",
	accent: "#EF5350",
	accentStrong: "#E53935",
	danger: "#c62828",
	onAccent: "#ffffff",
};

const darkColors: ThemePalette = {
	background: "#121212",
	surface: "#1f1f1f",
	surfaceAlt: "#2a2a2a",
	text: "#f1f1f1",
	mutedText: "#a9a9a9",
	border: "#343434",
	accent: "#EF5350",
	accentStrong: "#ff6b67",
	danger: "#ff7d7d",
	onAccent: "#ffffff",
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setThemeState] = useState<ThemeMode>("light");
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let mounted = true;

		const loadTheme = async () => {
			try {
				const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
				if (!mounted) return;
				if (saved === "dark" || saved === "light") {
					setThemeState(saved);
				}
			} catch (error) {
				console.warn("Failed to load theme", error);
			} finally {
				if (mounted) {
					setIsReady(true);
				}
			}
		};

		loadTheme();

		return () => {
			mounted = false;
		};
	}, []);

	const setTheme = useCallback(async (nextTheme: ThemeMode) => {
		setThemeState(nextTheme);
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		} catch (error) {
			console.warn("Failed to persist theme", error);
		}
	}, []);

	const toggleTheme = useCallback(async () => {
		const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
		await setTheme(nextTheme);
	}, [setTheme, theme]);

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			setTheme,
			toggleTheme,
			isReady,
			colors: theme === "dark" ? darkColors : lightColors,
		}),
		[isReady, setTheme, theme, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextValue => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}

	return context;
};
