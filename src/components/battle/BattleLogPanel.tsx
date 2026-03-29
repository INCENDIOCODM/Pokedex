import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BattleAction } from "@/src/interface/BattleInterface";

interface BattleResultLogProps {
	battleLog: BattleAction[];
	surfaceAltColor: string;
	surfaceColor: string;
	backgroundColor: string;
	textColor: string;
	mutedTextColor: string;
}

const BattleResultLog = ({
	battleLog,
	surfaceAltColor,
	surfaceColor,
	backgroundColor,
	textColor,
	mutedTextColor,
}: BattleResultLogProps) => {
	if (!battleLog.length) {
		return null;
	}

	return (
		<View>
			<Text style={[styles.logTitle, { color: textColor }]}>Battle Log</Text>
			<View style={[styles.logContainer, { backgroundColor: surfaceAltColor }]}>
				{battleLog.slice(-6).map((action, index) => (
					<View
						key={`${action.timestamp}-${index}`}
						style={[
							styles.logEntry,
							{
								backgroundColor:
									action.actor === "player" ? surfaceColor : backgroundColor,
								borderLeftColor:
									action.actor === "player" ? "#4CAF50" : "#FF6B6B",
							},
						]}>
						<Text style={[styles.logActor, { color: mutedTextColor }]}>
							{action.actor === "player" ? "Player" : "Opponent"}
						</Text>
						<Text
							style={[styles.logMessage, { color: textColor }]}
							numberOfLines={2}>
							{action.message}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export default BattleResultLog;

const styles = StyleSheet.create({
	logTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 12,
	},
	logContainer: {
		borderRadius: 5,
		overflow: "hidden",
		marginBottom: 24,
	},
	logEntry: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderLeftWidth: 3,
	},
	logActor: {
		fontSize: 11,
		fontWeight: "600",
		marginBottom: 4,
		textTransform: "uppercase",
	},
	logMessage: {
		fontSize: 12,
		fontWeight: "400",
		lineHeight: 16,
	},
});
