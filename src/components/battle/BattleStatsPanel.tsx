import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BattleResult } from "@/src/interface/BattleInterface";

interface BattleResultStatsProps {
	battleResult: BattleResult;
	isPlayerWon: boolean;
	surfaceAltColor: string;
	textColor: string;
	mutedTextColor: string;
}

const BattleResultStats = ({
	battleResult,
	isPlayerWon,
	surfaceAltColor,
	textColor,
	mutedTextColor,
}: BattleResultStatsProps) => {
	const winnerDamage = isPlayerWon
		? battleResult.playerDamageDealt
		: battleResult.opponentDamageDealt;
	const winnerTaken = isPlayerWon
		? battleResult.opponentDamageDealt
		: battleResult.playerDamageDealt;

	return (
		<View style={[styles.statsSection, { backgroundColor: surfaceAltColor }]}>
			<Text style={[styles.statsTitle, { color: textColor }]}>
				Battle Statistics
			</Text>

			<View
				style={[
					styles.statCard,
					{ backgroundColor: "#60A5FA22", borderColor: "#60A5FA55" },
				]}>
				<View style={styles.statHead}>
					<Ionicons name="layers-outline" size={16} color="#2563EB" />
					<Text style={[styles.statLabel, { color: mutedTextColor }]}>
						Rounds Played
					</Text>
				</View>
				<Text style={[styles.statValue, { color: textColor }]}>
					{battleResult.roundsPlayed}
				</Text>
			</View>

			<View
				style={[
					styles.statCard,
					{ backgroundColor: "#34D39922", borderColor: "#34D39955" },
				]}>
				<View style={styles.statHead}>
					<Ionicons name="flash-outline" size={16} color="#059669" />
					<Text style={[styles.statLabel, { color: mutedTextColor }]}>
						Winner Damage Dealt
					</Text>
				</View>
				<Text style={[styles.statValue, { color: textColor }]}>
					{winnerDamage} HP
				</Text>
			</View>

			<View
				style={[
					styles.statCard,
					{ backgroundColor: "#FBBF2422", borderColor: "#FBBF2455" },
				]}>
				<View style={styles.statHead}>
					<Ionicons name="shield-checkmark-outline" size={16} color="#D97706" />
					<Text style={[styles.statLabel, { color: mutedTextColor }]}>
						Winner Damage Taken
					</Text>
				</View>
				<Text style={[styles.statValue, { color: textColor }]}>
					{winnerTaken} HP
				</Text>
			</View>
		</View>
	);
};

export default BattleResultStats;

const styles = StyleSheet.create({
	statsSection: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderRadius: 20,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: "rgba(148,163,184,0.18)",
	},
	statsTitle: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 12,
	},
	statCard: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 8,
	},
	statHead: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 13,
		fontWeight: "600",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "700",
	},
});
