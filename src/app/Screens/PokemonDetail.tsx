import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import typeColors from "../../components/Pokemontype/poketype";
import SkeletonScreen from "./SkeletonScreen";
import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import { loadPokemonDetail } from "@/src/functions/PokemonRepository";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/context/ThemeContext";
import {
	CheckIfFavourite,
	ToggleFavourite,
} from "@/src/functions/FavouritePokemons";

export default function PokemonDetails() {
	const { pokemonId } = useLocalSearchParams<{ pokemonId: string }>();
	const router = useRouter();
	const { colors, theme } = useTheme();

	const [loading, setLoading] = React.useState(true);
	const [pokemon, setPokemon] = React.useState<PokemonAPI | null>(null);
	const [isFavorite, setIsFavorite] = React.useState(false);
	const [toggleLoading, setToggleLoading] = React.useState(false);

	React.useEffect(() => {
		let cancelled = false;
		const id = pokemonId ? Number(pokemonId) : null;
		if (!id) {
			setLoading(false);
			setPokemon(null);
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await loadPokemonDetail(id);
				if (!cancelled) {
					setPokemon(result.pokemon);
					const isFav = await CheckIfFavourite(id);
					setIsFavorite(isFav);
				}
			} catch (e) {
				console.warn("Failed to load pokemon data", e);
				if (!cancelled) setPokemon(null);
			} finally {
				// Artificial delay for the sake of UX
				await new Promise((r: any) => setTimeout(r, 400));
				if (!cancelled) setLoading(false);
			}
		};

		// show skeleton immediately, start fetch next frame
		const raf = requestAnimationFrame(() => fetchData());

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
		};
	}, [pokemonId]);

	const handleToggleFavorite = async () => {
		if (!pokemon) return;
		setToggleLoading(true);
		try {
			const result = await ToggleFavourite(pokemon.id);
			setIsFavorite(result);
		} catch (error) {
			console.error("Failed to toggle favorite", error);
		} finally {
			setToggleLoading(false);
		}
	};

	if (loading) return <SkeletonScreen variant={"detail"} />;

	if (!pokemon) {
		return (
			<View style={styles.center}>
				<Text style={{ fontSize: 16, color: colors.text }}>
					No Pokémon data available
				</Text>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Text style={{ color: "#fff" }}>Go Back</Text>
				</Pressable>
			</View>
		);
	}

	const mainType =
		pokemon.types && pokemon.types.length ? pokemon.types[0].type.name : null;
	const bg =
		mainType && (typeColors as any)[mainType]
			? (typeColors as any)[mainType]
			: "#fff";
	const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat;

	const typeEmoji: Record<string, string> = {
		fire: "🔥",
		water: "💧",
		grass: "🍃",
		electric: "⚡",
		psychic: "🔮",
		ice: "❄️",
		rock: "🪨",
		dragon: "🐉",
		ghost: "👻",
		fairy: "✨",
		poison: "☠️",
		normal: " ",
		fighting: "🥊",
		flying: "🕊️",
		bug: "🐛",
		ground: "🌍",
		steel: "⚙️",
		dark: "🌙",
		unknown: "❔",
		shadow: "🕶️",
	};

	const bgEmoji = mainType ? typeEmoji[mainType] || "" : "";

	return (
		<ScrollView
			contentContainerStyle={[
				styles.container,
				{ backgroundColor: colors.background },
			]}>
			<View style={[styles.header, { backgroundColor: bg }]}>
				<Pressable onPress={() => router.back()} style={styles.backPress}>
					<Text style={styles.backText}>←</Text>
				</Pressable>
				<Text style={styles.headerName}>{pokemon.name}</Text>
				<View style={styles.headerRightContainer}>
					<Pressable
						onPress={handleToggleFavorite}
						disabled={toggleLoading}
						style={styles.favoriteButton}>
						<Ionicons
							name={isFavorite ? "heart" : "heart-outline"}
							size={24}
							color={isFavorite ? "#ff4757" : "#fff"}
						/>
					</Pressable>
					<Text style={styles.headerId}>#{pokemon.id}</Text>
				</View>
			</View>

			<View style={styles.cardArea}>
				{bgEmoji ? (
					<View style={styles.emojiBg} pointerEvents="none">
						<Text
							style={[
								styles.emojiText,
								{ opacity: theme === "dark" ? 0.35 : 1 },
							]}>
							{Array(8).fill(bgEmoji).join(" ")}
						</Text>
					</View>
				) : null}
				<View style={styles.cardContent}>
					<Image
						source={{
							uri:
								pokemon.sprites?.other?.["official-artwork"]?.front_default ??
								pokemon.sprites?.front_default ??
								"",
						}}
						style={styles.image}
						contentFit="contain"
						cachePolicy="disk"
						transition={180}
					/>

					<View style={styles.typeRow}>
						{pokemon.types?.map((t) => (
							<View
								key={t.type.name}
								style={[
									styles.typeBadge,
									{
										backgroundColor: (typeColors as any)[t.type.name] || "#ddd",
									},
								]}>
								<Text style={styles.typeText}>{t.type.name}</Text>
							</View>
						))}
					</View>
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<View style={{ alignItems: "center" }}>
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							About
						</Text>
					</View>
					<View style={styles.aboutRow}>
						<View
							style={[
								styles.aboutBox,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
							]}>
							<Text style={[styles.aboutBoxLabel, { color: colors.mutedText }]}>
								HP
							</Text>
							<Text style={[styles.aboutBoxValue, { color: colors.text }]}>
								{hp ?? "—"}
							</Text>
						</View>
						<View
							style={[
								styles.aboutBox,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
							]}>
							<Text style={[styles.aboutBoxLabel, { color: colors.mutedText }]}>
								Height
							</Text>
							<Text style={[styles.aboutBoxValue, { color: colors.text }]}>
								{pokemon.height ?? "—"}
							</Text>
						</View>
						<View
							style={[
								styles.aboutBox,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
							]}>
							<Text style={[styles.aboutBoxLabel, { color: colors.mutedText }]}>
								Weight
							</Text>
							<Text style={[styles.aboutBoxValue, { color: colors.text }]}>
								{pokemon.weight ?? "—"}
							</Text>
						</View>
					</View>
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<View style={{ alignItems: "center" }}>
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							Stats
						</Text>
					</View>
					{pokemon.stats
						.filter((s) => s.stat.name !== "hp")
						.map((s) => (
							<View key={s.stat.name} style={styles.statRow}>
								<Text style={[styles.statName, { color: colors.text }]}>
									{s.stat.name.replace("-", " ")}
								</Text>
								<View
									style={[
										styles.statBarBackground,
										{ backgroundColor: colors.border },
									]}>
									<View
										style={[
											styles.statBarFill,
											{
												width: `${Math.min(s.base_stat, 100)}%`,
												backgroundColor: bg,
											},
										]}
									/>
								</View>
								<Text style={[styles.statValue, { color: colors.text }]}>
									{s.base_stat}
								</Text>
							</View>
						))}
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Abilities
					</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
						{pokemon.abilities?.map((ab) => (
							<View
								key={ab.ability.name}
								style={[
									styles.abilityBadge,
									{ backgroundColor: colors.surfaceAlt },
								]}>
								<Text style={[styles.abilityText, { color: colors.text }]}>
									{ab.ability.name}
								</Text>
							</View>
						))}
					</View>
				</View>

				<View style={{ height: 60 }} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flexGrow: 1 },
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	backButton: {
		marginTop: 12,
		backgroundColor: "#EF5350",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	header: {
		paddingTop: 48,
		paddingBottom: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	backPress: { position: "absolute", left: 12, top: 48, padding: 8 },
	backText: { fontSize: 22, color: "#fff" },
	headerName: {
		fontSize: 28,
		fontWeight: "700",
		color: "#fff",
		textTransform: "capitalize",
	},
	headerId: {
		position: "absolute",
		right: 12,
		top: 52,
		color: "#fff",
		fontWeight: "600",
	},
	headerRightContainer: {
		position: "absolute",
		right: 12,
		top: 48,
		alignItems: "center",
		gap: 4,
	},
	favoriteButton: {
		padding: 8,
		marginBottom: 4,
	},
	cardArea: { marginTop: -40, paddingHorizontal: 20, position: "relative" },
	image: {
		width: 260,
		height: 260,
		alignSelf: "center",
		resizeMode: "contain",
		backgroundColor: "transparent",
	},
	typeRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
		marginTop: 8,
	},
	typeBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		marginHorizontal: 4,
	},
	typeText: { color: "#fff", textTransform: "capitalize", fontWeight: "600" },
	section: {
		marginTop: 18,
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "transparent",
		padding: 12,
		borderRadius: 12,
		elevation: 2,
		justifyContent: "center",
		alignItems: "stretch",
	},
	sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
	aboutRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		width: "100%",
		paddingVertical: 6,
	},
	aboutBox: {
		width: 110,
		height: 110,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: "#e6e6e6",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 3,
	},
	aboutBoxLabel: { color: "#444", fontWeight: "600", marginBottom: 6 },
	aboutBoxValue: { fontWeight: "700", fontSize: 20, color: "#111" },

	cardContent: { zIndex: 1 },

	emojiBg: {
		position: "absolute",
		top: 35,
		left: 0,
		right: 0,
		height: 230,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 0,
		opacity: 0.15,
	},

	emojiText: { fontSize: 92, textAlign: "center" },

	statRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

	statName: {
		minWidth: 120,
		flexShrink: 0,
		marginRight: 8,
		textTransform: "capitalize",
		color: "#333",
	},

	statBarBackground: {
		flex: 1,
		height: 8,
		backgroundColor: "#eee",
		borderRadius: 8,
		marginHorizontal: 8,
		overflow: "hidden",
	},
	statBarFill: { height: 8, borderRadius: 8 },
	statValue: { width: 36, textAlign: "right", color: "#333" },
	abilityBadge: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
		marginRight: 8,
		marginBottom: 8,
	},
	abilityText: { textTransform: "capitalize", color: "#333" },
});
