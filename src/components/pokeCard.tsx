import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import typeColors from "./Pokemontype/poketype";
import { useState, useEffect, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
	CheckIfFavourite,
	ToggleFavourite,
} from "../functions/FavouritePokemons";

type PokemonTypeKey = keyof typeof typeColors;

type PokeCardProps = {
	pokemon: PokemonAPI;
	Rows: number;
	onFavoriteChange?: () => void;
	onPress?: () => void;
	disableNavigation?: boolean;
	showFavoriteButton?: boolean;
};

const PokeCard = ({
	pokemon,
	Rows,
	onFavoriteChange,
	onPress,
	disableNavigation = false,
	showFavoriteButton = true,
}: PokeCardProps) => {
	const router = useRouter();
	const { name, sprites, types, stats } = pokemon;
	const [isFavorite, setIsFavorite] = useState(false);
	const [loading, setLoading] = useState(false);

	const checkFavoriteStatus = useCallback(async () => {
		const status = await CheckIfFavourite(pokemon.id);
		setIsFavorite(status);
	}, [pokemon.id]);

	useEffect(() => {
		if (!showFavoriteButton) {
			return;
		}

		void checkFavoriteStatus();
	}, [checkFavoriteStatus, showFavoriteButton]);

	const handleToggleFavorite = async (e: any) => {
		if (!showFavoriteButton) {
			return;
		}

		e.stopPropagation();
		setLoading(true);
		try {
			const result = await ToggleFavourite(pokemon.id);
			setIsFavorite(result);
			onFavoriteChange?.();
		} catch (error) {
			console.error("Failed to toggle favorite", error);
		} finally {
			setLoading(false);
		}
	};

	const bg =
		types && types.length
			? typeColors[types[0].type.name as PokemonTypeKey]
			: "#eee";
	const primaryType = types?.[0]?.type?.name ?? "normal";
	const hp = stats.find((stat) => stat.stat.name === "hp")?.base_stat ?? 0;
	const attack =
		stats.find((stat) => stat.stat.name === "attack")?.base_stat ?? 0;
	const defense =
		stats.find((stat) => stat.stat.name === "defense")?.base_stat ?? 0;
	const speed =
		stats.find((stat) => stat.stat.name === "speed")?.base_stat ?? 0;

	// Use flex-basis for grid columns so two cards fit side-by-side cleanly
	const outerStyle: any = {
		flexBasis: Rows === 2 ? "49%" : "98%",
		margin: 1,
	};
	const isDetailRow = Rows === 1;

	return (
		<Pressable
			onPress={() => {
				if (onPress) {
					onPress();
					return;
				}

				if (disableNavigation) {
					return;
				}

				// requestAnimationFrame to allow UI to respond before navigation
				requestAnimationFrame(() => {
					try {
						router.push({
							pathname: "/Screens/PokemonDetail",
							params: { pokemonId: String(pokemon.id) },
						});
					} catch (e) {
						console.warn("Navigation error", e);
					}
				});
			}}
			style={outerStyle}>
			<View
				style={[
					styles.card,
					isDetailRow && styles.cardDetail,
					{
						backgroundColor: bg,
					},
				]}>
				{showFavoriteButton ? (
					/* Like Button */
					<Pressable
						onPress={handleToggleFavorite}
						disabled={loading}
						style={styles.likeButton}>
						<Ionicons
							name={isFavorite ? "heart" : "heart-outline"}
							size={20}
							color={isFavorite ? "#ff4757" : "#fff"}
						/>
					</Pressable>
				) : null}

				{isDetailRow ? (
					<View style={styles.detailWrap}>
						<View style={styles.detailLeft}>
							{sprites.front_default && (
								<Image
									source={{ uri: sprites.front_default }}
									style={styles.detailImage}
									contentFit="contain"
									cachePolicy="disk"
									transition={120}
								/>
							)}
							<Text style={styles.name}>{name}</Text>
							<Text style={styles.typePill}>{primaryType}</Text>
						</View>

						<View style={styles.statsPanel}>
							<View style={styles.statRow}>
								<Text style={styles.statLabel}>HP</Text>
								<Text style={styles.statValue}>{hp}</Text>
							</View>
							<View style={styles.statRow}>
								<Text style={styles.statLabel}>ATK</Text>
								<Text style={styles.statValue}>{attack}</Text>
							</View>
							<View style={styles.statRow}>
								<Text style={styles.statLabel}>DEF</Text>
								<Text style={styles.statValue}>{defense}</Text>
							</View>
							<View style={styles.statRow}>
								<Text style={styles.statLabel}>SPD</Text>
								<Text style={styles.statValue}>{speed}</Text>
							</View>
						</View>
					</View>
				) : (
					<>
						{sprites.front_default && (
							<Image
								source={{ uri: sprites.front_default }}
								style={styles.image}
								contentFit="contain"
								cachePolicy="disk"
								transition={120}
							/>
						)}
						<Text style={styles.name}>{name}</Text>
					</>
				)}
			</View>
		</Pressable>
	);
};

export default PokeCard;

const styles = StyleSheet.create({
	card: {
		padding: 10,
		alignItems: "center",
		margin: 10,
		borderRadius: 25,
		position: "relative",
	},
	cardDetail: {
		alignItems: "stretch",
		paddingVertical: 12,
		paddingHorizontal: "10%",
		borderRadius: 20,
	},
	likeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		padding: 8,
		zIndex: 10,
	},
	detailWrap: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	detailLeft: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	image: {
		width: 150,
		height: 150,
	},
	detailImage: {
		width: 120,
		height: 120,
	},
	name: {
		marginTop: -10,
		fontSize: 20,
		textTransform: "capitalize",
		textAlign: "center",
		color: "#ffffff",
		fontWeight: "700",
	},
	typePill: {
		marginTop: 6,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.18)",
		color: "#ffffff",
		fontSize: 11,
		fontWeight: "700",
		textTransform: "capitalize",
		letterSpacing: 0.4,
	},
	statsPanel: {
		width: 120,
		borderRadius: 16,
		paddingVertical: 10,
		paddingHorizontal: 10,
		backgroundColor: "rgba(255, 255, 255, 0.22)",
		gap: 8,
		marginLeft: 10,
		marginRight: 10,
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statLabel: {
		color: "#f4f6f9",
		fontWeight: "700",
		fontSize: 12,
		letterSpacing: 0.4,
	},
	statValue: {
		color: "#ffffff",
		fontWeight: "800",
		fontSize: 16,
	},
});
