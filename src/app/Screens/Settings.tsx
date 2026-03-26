import React from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.headerRow}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Text style={styles.backText}>Back</Text>
				</Pressable>
				<Text style={styles.title}>Settings</Text>
				<View style={styles.backButton} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Settings Panel</Text>
				<Text style={styles.cardText}>
					Theme and cache controls are available in the next updates.
				</Text>
			</View>
		</SafeAreaView>
	);
};

export default Settings;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		paddingHorizontal: 16,
		backgroundColor: "#f5f5f5",
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 8,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e1e1e1",
	},
	backButton: {
		minWidth: 60,
	},
	backText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1c1c1c",
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: "#1c1c1c",
	},
	card: {
		marginTop: 16,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: "#e1e1e1",
		backgroundColor: "#ffffff",
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1c1c1c",
	},
	cardText: {
		fontSize: 14,
		marginTop: 6,
		color: "#666666",
	},
});
