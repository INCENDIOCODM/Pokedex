import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { BattlePokemonSnapshot } from "@/src/interface/BattleInterface";

interface BattleResultMatchupProps {
	isPlayerWon: boolean;
	winnerPokemon: BattlePokemonSnapshot;
	loserPokemon: BattlePokemonSnapshot;
	surfaceColor: string;
	surfaceAltColor: string;
	borderColor: string;
	textColor: string;
	mutedTextColor: string;
}

const BattleResultMatchup = ({
	isPlayerWon,
	winnerPokemon,
	loserPokemon,
	surfaceColor,
	surfaceAltColor,
	borderColor,
	textColor,
	mutedTextColor,
}: BattleResultMatchupProps) => {
	const winnerTone = isPlayerWon ? "#22C55E" : "#F97316";
	const loserTone = isPlayerWon ? "#F97316" : "#22C55E";

	return (
		<View
			style={[
				styles.matchupSection,
				{ backgroundColor: surfaceColor, borderColor },
			]}>
			<View style={styles.pokemonBox}>
				<View
					style={[styles.frameGlow, { backgroundColor: `${winnerTone}33` }]}
				/>
				<View
					style={[
						styles.pokemonFrame,
						{
							backgroundColor: winnerTone,
							borderColor: `${winnerTone}AA`,
						},
					]}>
					{winnerPokemon.imageUrl ? (
						<Image
							source={{ uri: winnerPokemon.imageUrl }}
							style={styles.pokemonSprite}
							resizeMode="contain"
						/>
					) : null}
				</View>
				<Text style={[styles.pokemonLabel, { color: winnerTone }]}>Winner</Text>
				<Text style={[styles.pokemonName, { color: textColor }]}>
					{winnerPokemon.name}
				</Text>
			</View>

			<View style={[styles.vs, { backgroundColor: surfaceAltColor }]}>
				<Text style={[styles.vsText, { color: mutedTextColor }]}>vs</Text>
			</View>

			<View style={styles.pokemonBox}>
				<View
					style={[styles.frameGlow, { backgroundColor: `${loserTone}2A` }]}
				/>
				<View
					style={[
						styles.pokemonFrame,
						{
							backgroundColor: loserTone,
							borderColor: `${loserTone}AA`,
							opacity: 0.6,
						},
					]}>
					{loserPokemon.imageUrl ? (
						<Image
							source={{ uri: loserPokemon.imageUrl }}
							style={styles.pokemonSprite}
							resizeMode="contain"
						/>
					) : null}
				</View>
				<Text style={[styles.pokemonLabel, { color: mutedTextColor }]}>
					Loser
				</Text>
				<Text style={[styles.pokemonName, { color: textColor }]}>
					{loserPokemon.name}
				</Text>
			</View>
		</View>
	);
};

export default BattleResultMatchup;

const styles = StyleSheet.create({
	matchupSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		paddingHorizontal: 16,
		paddingVertical: 20,
		borderRadius: 20,
		borderWidth: 1,
		marginBottom: 24,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 2,
	},
	pokemonBox: {
		flex: 1,
		alignItems: "center",
		position: "relative",
	},
	frameGlow: {
		position: "absolute",
		width: 120,
		height: 120,
		borderRadius: 60,
		top: -6,
	},
	pokemonFrame: {
		width: 102,
		height: 102,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
		borderWidth: 2,
	},
	pokemonSprite: {
		width: "90%",
		height: "90%",
	},
	pokemonLabel: {
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.6,
		marginBottom: 4,
	},
	pokemonName: {
		fontSize: 15,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	vs: {
		width: 54,
		height: 54,
		borderRadius: 27,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(148,163,184,0.35)",
	},
	vsText: {
		fontSize: 24,
		fontWeight: "700",
		lineHeight: 22,
	},
});
