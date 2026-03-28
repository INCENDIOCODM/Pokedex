import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

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
	if (!photoUri) {
		return (
			<View style={styles.emptyContainer}>
				<TouchableOpacity
					style={styles.actionButtonSecondary}
					onPress={onRetake}>
					<Ionicons name="arrow-back" size={18} color="#FFFFFF" />
					<Text style={styles.actionText}>Go back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.previewContainer}>
			<Image source={{ uri: photoUri }} style={styles.previewImage} />

			<SafeAreaView style={styles.previewActions}>
				<View style={styles.previewButtonsRow}>
					<TouchableOpacity
						style={styles.actionButtonSecondary}
						onPress={onRetake}>
						<Ionicons name="refresh" size={50} color="#d95151" />
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionButtonPrimary}
						onPress={onUsePhoto}>
						<Ionicons name="checkmark-circle" size={50} color="#001E3D" />
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
		backgroundColor: "#000000",
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
		backgroundColor: "rgba(180, 12, 12, 0.48)",
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
		backgroundColor: "#A8FFE0",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 6,
	},
	actionText: {
		color: "#FFFFFF",
		fontWeight: "700",
	},
	actionTextPrimary: {
		color: "#001E3D",
		fontWeight: "800",
	},
	emptyContainer: {
		flex: 1,
		backgroundColor: "#0A121D",
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
