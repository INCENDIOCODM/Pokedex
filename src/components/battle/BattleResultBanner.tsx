import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BattleResultBannerProps {
	isPlayerWon: boolean;
}

const BattleResultBanner = ({ isPlayerWon }: BattleResultBannerProps) => {
	const tone = isPlayerWon ? "#22C55E" : "#F97316";
	const subtitle = isPlayerWon
		? "Your strategy overwhelmed the opponent"
		: "Regroup and strike back in the next battle";

	return (
		<View style={[styles.resultBanner, { backgroundColor: tone }]}>
			<View style={styles.bannerIconWrap}>
				<Ionicons
					name={isPlayerWon ? "trophy" : "flame"}
					size={34}
					color="white"
					style={styles.bannerIcon}
				/>
			</View>
			<Text style={styles.resultTitle}>
				{isPlayerWon ? "Victory" : "Defeat"}
			</Text>
			<Text style={styles.resultSubtitle}>{subtitle}</Text>
		</View>
	);
};

export default BattleResultBanner;

const styles = StyleSheet.create({
	resultBanner: {
		paddingVertical: 24,
		paddingHorizontal: 16,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.35)",
		alignItems: "center",
		marginBottom: 24,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 14,
		elevation: 6,
	},
	bannerIconWrap: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 10,
	},
	bannerIcon: {
		marginTop: 1,
	},
	resultTitle: {
		color: "white",
		fontSize: 32,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	resultSubtitle: {
		marginTop: 4,
		color: "rgba(255,255,255,0.95)",
		fontSize: 13,
		fontWeight: "500",
	},
});
