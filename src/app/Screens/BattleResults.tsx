import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import type { BattleResult } from "@/src/interface/BattleInterface";
import { saveBattleResultToHistory } from "@/src/functions/BattleHistoryStorage";
import BattleResultBanner from "@/src/components/battle/BattleResultBanner";
import BattleResultMatchup from "@/src/components/battle/BattleResultMatchup";
import BattleResultStats from "@/src/components/battle/BattleStatsPanel";
import BattleResultLog from "@/src/components/battle/BattleLogPanel";
import BattleResultErrorState from "@/src/components/battle/BattleResultErrorState";

const BattleResults = () => {
	const router = useRouter();
	const { colors } = useTheme();
	const { result } = useLocalSearchParams();

	const [battleResult, setBattleResult] = React.useState<BattleResult | null>(
		null,
	);

	React.useEffect(() => {
		if (result) {
			try {
				const parsed = JSON.parse(result as string) as BattleResult;
				setBattleResult(parsed);
				void saveBattleResultToHistory(parsed);
			} catch (error) {
				console.error("Failed to parse battle result", error);
			}
		}
	}, [result]);

	if (!battleResult) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}>
				<BattleResultErrorState textColor={colors.text} />
			</SafeAreaView>
		);
	}

	const isPlayerWon = battleResult.winner === "player";
	const winnerPokemon = isPlayerWon
		? battleResult.playerPokemon
		: battleResult.opponentPokemon;
	const loserPokemon = isPlayerWon
		? battleResult.opponentPokemon
		: battleResult.playerPokemon;
	const resultTone = isPlayerWon ? "#22C55E" : "#F97316";
	const secondaryTone = isPlayerWon
		? "rgba(56,189,248,0.16)"
		: "rgba(168,85,247,0.16)";

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			<View pointerEvents="none" style={styles.backgroundLayer}>
				<View
					style={[
						styles.orb,
						styles.orbOne,
						{ backgroundColor: `${resultTone}26` },
					]}
				/>
				<View
					style={[
						styles.orb,
						styles.orbTwo,
						{ backgroundColor: secondaryTone },
					]}
				/>
				<View
					style={[
						styles.orb,
						styles.orbThree,
						{ backgroundColor: "#38BDF81F" },
					]}
				/>
			</View>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}>
				<BattleResultBanner isPlayerWon={isPlayerWon} />

				<BattleResultMatchup
					isPlayerWon={isPlayerWon}
					winnerPokemon={winnerPokemon}
					loserPokemon={loserPokemon}
					surfaceColor={colors.surface}
					surfaceAltColor={colors.surfaceAlt}
					borderColor={colors.border}
					textColor={colors.text}
					mutedTextColor={colors.mutedText}
				/>

				<BattleResultStats
					battleResult={battleResult}
					isPlayerWon={isPlayerWon}
					surfaceAltColor={colors.surfaceAlt}
					textColor={colors.text}
					mutedTextColor={colors.mutedText}
				/>

				<BattleResultLog
					battleLog={battleResult.battleLog}
					surfaceAltColor={colors.surfaceAlt}
					surfaceColor={colors.surface}
					backgroundColor={colors.background}
					textColor={colors.text}
					mutedTextColor={colors.mutedText}
				/>

				{/* Action Buttons */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[
							styles.button,
							{
								backgroundColor: colors.surfaceAlt,
								borderColor: colors.border,
								borderWidth: 1,
							},
						]}
						onPress={() => {
							router.push("../Screens/BattleHistory");
						}}>
						<Ionicons name="time-outline" size={16} color={colors.text} />
						<Text style={[styles.buttonText, { color: colors.text }]}>
							View History
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.button,
							styles.primaryButton,
							{ backgroundColor: colors.accent },
						]}
						onPress={() => {
							router.push("../Screens/BattleSelection");
						}}>
						<Ionicons name="play" size={16} color="white" />
						<Text style={styles.buttonText}>Battle Again</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.button,
							{
								backgroundColor: colors.surfaceAlt,
								borderColor: colors.border,
								borderWidth: 1,
							},
						]}
						onPress={() => {
							router.push({
								pathname: "../Screens/PokemonDetail",
								params: { pokemonId: winnerPokemon.id.toString() },
							});
						}}>
						<Ionicons name="information-circle" size={16} color={colors.text} />
						<Text style={[styles.buttonText, { color: colors.text }]}>
							View Winner
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default BattleResults;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	buttonContainer: {
		gap: 10,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 13,
		borderRadius: 14,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 2,
	},
	primaryButton: {
		shadowColor: "#0B3B8A",
		shadowOpacity: 0.25,
		elevation: 4,
	},
	buttonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	backgroundLayer: {
		...StyleSheet.absoluteFillObject,
		overflow: "hidden",
	},
	orb: {
		position: "absolute",
		borderRadius: 999,
	},
	orbOne: {
		width: 220,
		height: 220,
		top: -80,
		right: -40,
	},
	orbTwo: {
		width: 180,
		height: 180,
		top: 220,
		left: -70,
	},
	orbThree: {
		width: 200,
		height: 200,
		bottom: -90,
		right: -80,
	},
});
