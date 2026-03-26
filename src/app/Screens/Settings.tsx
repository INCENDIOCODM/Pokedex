import React from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";

const Settings = () => {
	const router = useRouter();
	const { theme, setTheme, colors } = useTheme();

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
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					Appearance
				</Text>
				<Text style={[styles.sectionHint, { color: colors.mutedText }]}>
					Choose your preferred app theme
				</Text>
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
});
