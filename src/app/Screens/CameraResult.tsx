import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";

type CameraResultProps = {
	photoUri: string;
	onRetake: () => void;
	onUsePhoto: () => void;
};

const CameraResult = ({
	photoUri,
	onRetake,
	onUsePhoto,
}: CameraResultProps) => {
	const { colors, theme } = useTheme();
	const secondaryButtonBg =
		theme === "dark" ? "rgba(255, 0, 0, 0.72)" : "rgba(255, 0, 0, 0.72)";
	const primaryButtonBg = theme === "dark" ? "#1dca91" : "#22d245";
	const primaryContentColor = colors.onAccent;

	if (!photoUri) {
		return (
			<View
				style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
				<TouchableOpacity
					style={[
						styles.actionButtonSecondary,
						{ backgroundColor: secondaryButtonBg },
					]}
					onPress={onRetake}>
					<Ionicons name="arrow-back" size={18} color={colors.text} />
					<Text style={[styles.actionText, { color: colors.text }]}>
						Go back
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View
			style={[styles.previewContainer, { backgroundColor: colors.background }]}>
			<Image source={{ uri: photoUri }} style={styles.previewImage} />

			<SafeAreaView style={styles.previewActions}>
				<View style={styles.previewButtonsRow}>
					<TouchableOpacity
						style={[
							styles.actionButtonSecondary,
							{ backgroundColor: secondaryButtonBg },
						]}
						onPress={onRetake}>
						<Ionicons name="refresh" size={50} color={"#ffffff"} />
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.actionButtonPrimary,
							{ backgroundColor: primaryButtonBg },
						]}
						onPress={onUsePhoto}>
						<Ionicons
							name="checkmark-circle"
							size={50}
							color={primaryContentColor}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
};

export default CameraResult;

const styles = StyleSheet.create({
	previewContainer: {
		flex: 1,
	},
	previewImage: {
		marginTop: "10%",
		width: "100%",
		height: "65%",
		borderTopLeftRadius: 26,
		borderTopRightRadius: 26,
		borderBottomEndRadius: 0,
	},
	previewOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.26)",
	},
	previewActions: {
		padding: 20,
		marginTop: "5%",
	},
	previewTitle: {
		color: "#FFFFFF",
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 4,
	},
	previewSubtitle: {
		color: "#DFE8F4",
		marginBottom: 14,
	},
	previewButtonsRow: {
		flexDirection: "row",
		gap: "30%",
		justifyContent: "center",
		alignContent: "center",
	},
	actionButtonSecondary: {
		borderRadius: 100,
		width: 100,
		height: 100,
		paddingVertical: 12,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
	},
	actionButtonPrimary: {
		borderRadius: 100,
		width: 100,
		height: 100,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
	},
	actionText: {
		fontWeight: "700",
	},
	actionTextPrimary: {
		color: "#001E3D",
		fontWeight: "800",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		gap: 12,
	},
	emptyTitle: {
		color: "#FFFFFF",
		fontSize: 24,
		fontWeight: "800",
	},
	emptySubtitle: {
		color: "#DFE8F4",
		fontSize: 14,
		textAlign: "center",
		marginBottom: 8,
	},
});
