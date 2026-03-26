import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearCache } from "@/src/functions/PokemonCacheDb";
import { THEME_STORAGE_KEY, useTheme } from "@/src/context/ThemeContext";

const LIST_VIEW_STORAGE_KEY = "ListView";
const LAST_CACHE_CLEAR_AT_KEY = "CACHE_LAST_CLEARED_AT";

const Settings = () => {
	const router = useRouter();
	const { theme, setTheme, colors } = useTheme();
	const [busyAction, setBusyAction] = useState<
		null | "all" | "images" | "list"
	>(null);
	const [lastClearedAt, setLastClearedAt] = useState<string | null>(null);

	useEffect(() => {
		const loadLastClearedAt = async () => {
			try {
				const value = await AsyncStorage.getItem(LAST_CACHE_CLEAR_AT_KEY);
				setLastClearedAt(value);
			} catch (error) {
				console.warn("Failed to load last cache clear info", error);
			}
		};

		loadLastClearedAt();
	}, []);

	const persistLastClearedAt = useCallback(async () => {
		const now = new Date().toISOString();
		setLastClearedAt(now);
		await AsyncStorage.setItem(LAST_CACHE_CLEAR_AT_KEY, now);
	}, []);

	const clearImageCaches = useCallback(async () => {
		const imageApi = Image as unknown as {
			clearDiskCache?: () => Promise<boolean>;
			clearMemoryCache?: () => Promise<boolean>;
		};

		await imageApi.clearMemoryCache?.();
		await imageApi.clearDiskCache?.();
	}, []);

	const clearAllCaches = useCallback(async () => {
		setBusyAction("all");
		try {
			await clearCache();
			await clearImageCaches();

			const keys = await AsyncStorage.getAllKeys();
			const removable = keys.filter(
				(key) => key !== THEME_STORAGE_KEY && key !== LAST_CACHE_CLEAR_AT_KEY,
			);
			if (removable.length) {
				await AsyncStorage.multiRemove(removable);
			}

			await persistLastClearedAt();
			Alert.alert("Cache Cleared", "Data cache and image cache were cleared.");
		} catch (error) {
			console.error("Failed to clear all cache", error);
			Alert.alert("Error", "Could not clear cache. Please try again.");
		} finally {
			setBusyAction(null);
		}
	}, [clearImageCaches, persistLastClearedAt]);

	const clearOnlyImages = useCallback(async () => {
		setBusyAction("images");
		try {
			await clearImageCaches();
			await persistLastClearedAt();
			Alert.alert("Image Cache Cleared", "Only image cache was cleared.");
		} catch (error) {
			console.error("Failed to clear image cache", error);
			Alert.alert("Error", "Could not clear image cache. Please try again.");
		} finally {
			setBusyAction(null);
		}
	}, [clearImageCaches, persistLastClearedAt]);

	const clearListPreference = useCallback(async () => {
		setBusyAction("list");
		try {
			await AsyncStorage.removeItem(LIST_VIEW_STORAGE_KEY);
			Alert.alert(
				"Preference Reset",
				"Saved list layout preference has been reset.",
			);
		} catch (error) {
			console.error("Failed to clear list preference", error);
			Alert.alert("Error", "Could not reset list layout preference.");
		} finally {
			setBusyAction(null);
		}
	}, []);

	const confirmAndRun = useCallback(
		(title: string, message: string, runAction: () => Promise<void>) => {
			Alert.alert(title, message, [
				{ text: "Cancel", style: "cancel" },
				{
					text: "Continue",
					style: "destructive",
					onPress: () => {
						void runAction();
					},
				},
			]);
		},
		[],
	);

	const lastClearedLabel = useMemo(() => {
		if (!lastClearedAt) return "Never";
		const date = new Date(lastClearedAt);
		if (Number.isNaN(date.getTime())) return "Unknown";
		return date.toLocaleString();
	}, [lastClearedAt]);

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: colors.background }]}>
			<View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Text style={[styles.backText, { color: colors.text }]}>Back</Text>
				</Pressable>
				<Text style={[styles.title, { color: colors.text }]}>Settings</Text>
				<View style={styles.backButton} />
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: colors.surface, borderColor: colors.border },
				]}>
				<View style={styles.row}>
					<View style={styles.rowTextWrap}>
						<Text style={[styles.rowTitle, { color: colors.text }]}>
							Dark Mode
						</Text>
						<Text style={[styles.rowSubtitle, { color: colors.mutedText }]}>
							Switch between light and dark theme
						</Text>
					</View>
					<Switch
						value={theme === "dark"}
						onValueChange={(nextValue) => {
							void setTheme(nextValue ? "dark" : "light");
						}}
						trackColor={{ false: "#bcbcbc", true: colors.accent }}
						thumbColor={colors.onAccent}
					/>
				</View>
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: colors.surface, borderColor: colors.border },
				]}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					Cache Controls
				</Text>
				<Text style={[styles.sectionHint, { color: colors.mutedText }]}>
					Last cleaned: {lastClearedLabel}
				</Text>

				<Pressable
					disabled={busyAction !== null}
					style={({ pressed }) => [
						styles.primaryAction,
						{ backgroundColor: colors.accent },
						pressed && styles.primaryActionPressed,
						busyAction !== null && styles.disabled,
					]}
					onPress={() =>
						confirmAndRun(
							"Clear all cache",
							"This will clear cached Pokemon data and image files.",
							clearAllCaches,
						)
					}>
					{busyAction === "all" ? (
						<ActivityIndicator color={colors.onAccent} />
					) : (
						<Text
							style={[styles.primaryActionText, { color: colors.onAccent }]}>
							Clear data + images cache
						</Text>
					)}
				</Pressable>

				<Pressable
					disabled={busyAction !== null}
					style={({ pressed }) => [
						styles.secondaryAction,
						{ borderColor: colors.border, backgroundColor: colors.surfaceAlt },
						pressed && styles.secondaryActionPressed,
						busyAction !== null && styles.disabled,
					]}
					onPress={() =>
						confirmAndRun(
							"Clear image cache",
							"Only downloaded images will be removed.",
							clearOnlyImages,
						)
					}>
					{busyAction === "images" ? (
						<ActivityIndicator color={colors.text} />
					) : (
						<Text style={[styles.secondaryActionText, { color: colors.text }]}>
							Clear images only
						</Text>
					)}
				</Pressable>
			</View>

			<View
				style={[
					styles.card,
					{ backgroundColor: colors.surface, borderColor: colors.border },
				]}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>Extra</Text>
				<Text style={[styles.sectionHint, { color: colors.mutedText }]}>
					Useful quick reset for your home list view style
				</Text>
				<Pressable
					disabled={busyAction !== null}
					style={({ pressed }) => [
						styles.tertiaryAction,
						{ borderColor: colors.border },
						pressed && styles.secondaryActionPressed,
						busyAction !== null && styles.disabled,
					]}
					onPress={clearListPreference}>
					{busyAction === "list" ? (
						<ActivityIndicator color={colors.text} />
					) : (
						<Text style={[styles.secondaryActionText, { color: colors.text }]}>
							Reset saved list layout
						</Text>
					)}
				</Pressable>
			</View>
		</SafeAreaView>
	);
};

export default Settings;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		paddingHorizontal: 16,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 8,
		paddingBottom: 12,
		borderBottomWidth: 1,
	},
	backButton: {
		minWidth: 60,
	},
	backText: {
		fontSize: 16,
		fontWeight: "600",
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
	},
	card: {
		marginTop: 16,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	rowTextWrap: {
		flex: 1,
	},
	rowTitle: {
		fontSize: 17,
		fontWeight: "600",
	},
	rowSubtitle: {
		fontSize: 13,
		marginTop: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	sectionHint: {
		fontSize: 13,
		marginTop: 4,
		marginBottom: 12,
	},
	primaryAction: {
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	primaryActionPressed: {
		opacity: 0.85,
	},
	primaryActionText: {
		fontWeight: "700",
		fontSize: 15,
	},
	secondaryAction: {
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	secondaryActionPressed: {
		opacity: 0.8,
	},
	secondaryActionText: {
		fontWeight: "600",
		fontSize: 15,
	},
	tertiaryAction: {
		height: 46,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	disabled: {
		opacity: 0.6,
	},
});
