import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import {
	clearBattleHistory,
	getBattleHistory,
} from "@/src/functions/BattleHistoryStorage";
import type { BattleHistoryItem } from "@/src/interface/BattleInterface";

const BattleHistory = () => {
	const router = useRouter();
	const { colors, theme } = useTheme();
	const isDark = theme === "dark";
	const [history, setHistory] = React.useState<BattleHistoryItem[]>([]);
	const [loading, setLoading] = React.useState(true);

	const getOutcomeColors = React.useCallback(
		(playerWon: boolean) => {
			const tone = playerWon ? "76,175,80" : "239,68,68";
			return {
				cardBackground: isDark ? `rgba(${tone},0.22)` : `rgba(${tone},0.14)`,
				cardBorder: isDark ? `rgba(${tone},0.52)` : `rgba(${tone},0.34)`,
				chipBackground: isDark ? `rgba(${tone},0.26)` : `rgba(${tone},0.18)`,
				chipText: playerWon ? "#4CAF50" : "#FF6B6B",
			};
		},
		[isDark],
	);

	const loadHistory = React.useCallback(async () => {
		setLoading(true);
		const data = await getBattleHistory(50);
		setHistory(data);
		setLoading(false);
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadHistory();
		}, [loadHistory]),
	);

	const formatDate = (timestamp: number) => {
		try {
			return new Date(timestamp).toLocaleString();
		} catch {
			return "Unknown date";
		}
	};

	const onClearHistory = () => {
		Alert.alert("Clear Battle History", "This will remove all saved battles.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Clear",
				style: "destructive",
				onPress: async () => {
					await clearBattleHistory();
					setHistory([]);
				},
			},
		]);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			<View
				style={[
					styles.header,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<View style={styles.headerLeft}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.iconButton}>
						<Ionicons name="arrow-back" size={20} color={colors.text} />
					</TouchableOpacity>
					<Text style={[styles.title, { color: colors.text }]}>
						Battle History
					</Text>
				</View>
				<TouchableOpacity
					onPress={onClearHistory}
					style={[styles.clearButton, { borderColor: colors.border }]}
					disabled={history.length === 0}>
					<Ionicons
						name="trash-outline"
						size={16}
						color={history.length === 0 ? colors.border : colors.text}
					/>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.centerState}>
					<Text style={{ color: colors.mutedText }}>Loading...</Text>
				</View>
			) : history.length === 0 ? (
				<View style={styles.centerState}>
					<Ionicons name="time-outline" size={48} color={colors.border} />
					<Text style={[styles.emptyTitle, { color: colors.text }]}>
						No battles yet
					</Text>
					<Text style={[styles.emptySubtitle, { color: colors.mutedText }]}>
						Finish a battle and it will appear here.
					</Text>
				</View>
			) : (
				<FlatList
					data={history}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContent}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={7}
					removeClippedSubviews
					renderItem={({ item }) => {
						const playerWon = item.winner === "player";
						const outcomeColors = getOutcomeColors(playerWon);
						return (
							<View
								style={[
									styles.card,
									{
										backgroundColor: outcomeColors.cardBackground,
										borderColor: outcomeColors.cardBorder,
									},
								]}>
								<View style={styles.rowTop}>
									<Text style={[styles.matchup, { color: colors.text }]}>
										{item.playerPokemonName} vs {item.opponentPokemonName}
									</Text>
									<Text
										style={[
											styles.resultChip,
											{
												color: outcomeColors.chipText,
												backgroundColor: outcomeColors.chipBackground,
												borderColor: outcomeColors.cardBorder,
											},
										]}>
										{playerWon ? "Win" : "Loss"}
									</Text>
								</View>
								<Text style={[styles.meta, { color: colors.mutedText }]}>
									{formatDate(item.timestamp)}
								</Text>
								<Text style={[styles.meta, { color: colors.mutedText }]}>
									Rounds: {item.roundsPlayed} | Player DMG:{" "}
									{item.playerDamageDealt} | Opponent DMG:{" "}
									{item.opponentDamageDealt}
								</Text>
							</View>
						);
					}}
				/>
			)}
		</SafeAreaView>
	);
};

export default BattleHistory;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	iconButton: {
		padding: 6,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
	},
	clearButton: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	centerState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		gap: 8,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 13,
		textAlign: "center",
	},
	listContent: {
		padding: 12,
		gap: 10,
	},
	card: {
		borderWidth: 1,
		borderRadius: 10,
		padding: 12,
		gap: 6,
	},
	rowTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	matchup: {
		fontSize: 14,
		fontWeight: "700",
		textTransform: "capitalize",
	},
	resultChip: {
		fontSize: 12,
		fontWeight: "700",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		borderWidth: 1,
		overflow: "hidden",
	},
	meta: {
		fontSize: 12,
	},
});
