import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image } from "expo-image";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";
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

const formatLabel = (value: string) =>
	value
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

const getReadableTextColor = (hexColor: string) => {
	const safeHex = hexColor.replace("#", "");
	const normalized =
		safeHex.length === 3
			? safeHex
					.split("")
					.map((char) => `${char}${char}`)
					.join("")
			: safeHex;

	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);

	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return "#ffffff";
	}

	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance > 160 ? "#171717" : "#ffffff";
};

const statColorMap: Record<string, string> = {
	hp: "#2EAD4B",
	attack: "#E53935",
	defense: "#2979FF",
	"special-attack": "#8E24AA",
	"special-defense": "#00ACC1",
	speed: "#FBC02D",
};

const chipPalette = [
	"#ef5350",
	"#42a5f5",
	"#66bb6a",
	"#ffa726",
	"#ab47bc",
	"#26c6da",
];

const QUICK_FACT_CARD_GAP = 10;

const getQuickFactColumns = (screenWidth: number) => {
	if (screenWidth >= 1024) return 4;
	if (screenWidth >= 700) return 3;
	return 2;
};

const getStatColor = (statName: string, fallback: string) =>
	statColorMap[statName] ?? fallback;

const rgbaFromHex = (hexColor: string, alpha: number) => {
	const safeHex = hexColor.replace("#", "");
	const normalized =
		safeHex.length === 3
			? safeHex
					.split("")
					.map((char) => `${char}${char}`)
					.join("")
			: safeHex;

	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);

	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return `rgba(239, 83, 80, ${alpha})`;
	}

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getMoveColor = (moveName: string) => {
	const hash = moveName
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return chipPalette[hash % chipPalette.length];
};

export default function PokemonDetails() {
	const { pokemonId } = useLocalSearchParams<{ pokemonId: string }>();
	const router = useRouter();
	const { colors, theme } = useTheme();
	const { width: screenWidth } = useWindowDimensions();

	const [loading, setLoading] = React.useState(true);
	const [pokemon, setPokemon] = React.useState<PokemonAPI | null>(null);
	const [isFavorite, setIsFavorite] = React.useState(false);
	const [toggleLoading, setToggleLoading] = React.useState(false);
	const [quickFactsWidth, setQuickFactsWidth] = React.useState(0);
	const imageUri =
		pokemon?.sprites?.other?.["official-artwork"]?.front_default ??
		pokemon?.sprites?.front_default ??
		"";

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
					No Pokemon data available
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
			: colors.accent;
	const heroTextColor = getReadableTextColor(bg);
	const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat;
	const totalBaseStats = pokemon.stats.reduce(
		(total, entry) => total + entry.base_stat,
		0,
	);
	const hiddenAbilities = pokemon.abilities.filter(
		(ability) => ability.is_hidden,
	);
	const previewMoves = pokemon.moves.slice(0, 14);
	const quickFactColumns = getQuickFactColumns(screenWidth);
	const quickFactCardWidth =
		quickFactsWidth > 0
			? (quickFactsWidth - QUICK_FACT_CARD_GAP * (quickFactColumns - 1)) /
				quickFactColumns
			: undefined;
	const quickFactCardDynamicStyle = { width: quickFactCardWidth };

	return (
		<ScrollView
			contentContainerStyle={[
				styles.container,
				{ backgroundColor: colors.background },
			]}>
			<View style={[styles.hero, { backgroundColor: bg }]}>
				<View style={styles.heroCircleLg} />
				<View style={styles.heroCircleSm} />

				<View style={styles.heroTopRow}>
					<Pressable
						onPress={() => router.back()}
						style={styles.iconRoundButton}>
						<Ionicons name="chevron-back" size={20} color={heroTextColor} />
					</Pressable>
					<Pressable
						onPress={handleToggleFavorite}
						disabled={toggleLoading}
						style={styles.iconRoundButton}>
						<Ionicons
							name={isFavorite ? "heart" : "heart-outline"}
							size={20}
							color={isFavorite ? "#ff4757" : heroTextColor}
						/>
					</Pressable>
				</View>

				<View style={styles.heroTextArea}>
					<Text style={[styles.headerName, { color: heroTextColor }]}>
						{pokemon.name}
					</Text>
					<View style={styles.metaRow}>
						<Text style={[styles.headerId, { color: heroTextColor }]}>
							#{pokemon.id}
						</Text>
						<View
							style={[styles.metaPill, { borderColor: `${heroTextColor}66` }]}>
							<Text style={[styles.metaPillText, { color: heroTextColor }]}>
								BST {totalBaseStats}
							</Text>
						</View>
					</View>

					<View style={styles.typeRow}>
						{pokemon.types?.map((t) => {
							const typeBg =
								(typeColors as any)[t.type.name] || colors.surfaceAlt;
							const typeTextColor = getReadableTextColor(typeBg);
							return (
								<View
									key={t.type.name}
									style={[styles.typeBadge, { backgroundColor: typeBg }]}>
									<Text style={[styles.typeText, { color: typeTextColor }]}>
										{formatLabel(t.type.name)}
									</Text>
								</View>
							);
						})}
					</View>
				</View>
			</View>

			<View style={styles.bodyWrap}>
				<View
					style={[
						styles.imagePanel,
						{
							backgroundColor: colors.surface,
							borderColor: colors.border,
							shadowColor: theme === "dark" ? "#000" : bg,
						},
					]}>
					<Image
						source={{ uri: imageUri }}
						style={styles.image}
						contentFit="contain"
						cachePolicy="disk"
						transition={220}
					/>
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Overview
					</Text>
					<View
						style={styles.quickFactsGrid}
						onLayout={(event) =>
							setQuickFactsWidth(event.nativeEvent.layout.width)
						}>
						<View
							style={[
								styles.factCard,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
								quickFactCardDynamicStyle,
							]}>
							<Text style={[styles.factLabel, { color: colors.mutedText }]}>
								HP
							</Text>
							<Text style={[styles.factValue, { color: colors.text }]}>
								{hp ?? "-"}
							</Text>
						</View>
						<View
							style={[
								styles.factCard,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
								quickFactCardDynamicStyle,
							]}>
							<Text style={[styles.factLabel, { color: colors.mutedText }]}>
								Height
							</Text>
							<Text style={[styles.factValue, { color: colors.text }]}>
								{(pokemon.height / 10).toFixed(1)} m
							</Text>
						</View>
						<View
							style={[
								styles.factCard,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
								quickFactCardDynamicStyle,
							]}>
							<Text style={[styles.factLabel, { color: colors.mutedText }]}>
								Weight
							</Text>
							<Text style={[styles.factValue, { color: colors.text }]}>
								{(pokemon.weight / 10).toFixed(1)} kg
							</Text>
						</View>
						<View
							style={[
								styles.factCard,
								{
									backgroundColor: colors.surfaceAlt,
									borderColor: colors.border,
								},
								quickFactCardDynamicStyle,
							]}>
							<Text style={[styles.factLabel, { color: colors.mutedText }]}>
								Base XP
							</Text>
							<Text style={[styles.factValue, { color: colors.text }]}>
								{pokemon.base_experience ?? "-"}
							</Text>
						</View>
					</View>
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Base Stats
					</Text>
					{pokemon.stats.map((entry) => {
						const statPct = Math.min((entry.base_stat / 120) * 100, 100);
						const statColor = getStatColor(entry.stat.name, bg);
						return (
							<View key={entry.stat.name} style={styles.statRow}>
								<View style={styles.statTextRow}>
									<Text style={[styles.statName, { color: colors.text }]}>
										{formatLabel(entry.stat.name)}
									</Text>
									<Text style={[styles.statValue, { color: colors.mutedText }]}>
										{entry.base_stat}
									</Text>
								</View>
								<View
									style={[
										styles.statBarBackground,
										{ backgroundColor: colors.surfaceAlt },
									]}>
									<View
										style={[
											styles.statBarFill,
											{
												width: `${statPct}%`,
												backgroundColor: statColor,
											},
										]}
									/>
								</View>
							</View>
						);
					})}
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Abilities
					</Text>
					<View style={styles.abilitiesWrap}>
						{pokemon.abilities?.map((ab) => (
							// Keep hidden abilities visually distinct for faster scanning.
							<View
								key={ab.ability.name}
								style={[
									styles.abilityBadge,
									{
										backgroundColor: ab.is_hidden
											? rgbaFromHex("#ef5350", theme === "dark" ? 0.25 : 0.12)
											: colors.surfaceAlt,
										borderColor: ab.is_hidden
											? rgbaFromHex("#ef5350", 0.6)
											: colors.border,
									},
								]}>
								<Text style={[styles.abilityText, { color: colors.text }]}>
									{ab.is_hidden
										? `${formatLabel(ab.ability.name)} (Hidden)`
										: formatLabel(ab.ability.name)}
								</Text>
							</View>
						))}
					</View>
					{hiddenAbilities.length > 0 ? (
						<Text
							style={[styles.hiddenAbilityHint, { color: colors.mutedText }]}>
							Hidden abilities: {hiddenAbilities.length}
						</Text>
					) : null}
				</View>

				<View
					style={[
						styles.section,
						{ backgroundColor: colors.surface, borderColor: colors.border },
					]}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Moves Spotlight
					</Text>
					<View style={styles.movesWrap}>
						{previewMoves.map((move) => {
							const moveColor = getMoveColor(move.move.name);
							return (
								<View
									key={move.move.name}
									style={[
										styles.moveChip,
										{
											backgroundColor: rgbaFromHex(
												moveColor,
												theme === "dark" ? 0.28 : 0.18,
											),
											borderColor: rgbaFromHex(moveColor, 0.55),
										},
									]}>
									<Text style={[styles.moveChipText, { color: colors.text }]}>
										{formatLabel(move.move.name)}
									</Text>
								</View>
							);
						})}
					</View>
				</View>

				<View style={{ height: 36 }} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flexGrow: 1, paddingBottom: 16 },
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
	hero: {
		paddingTop: 56,
		paddingHorizontal: 18,
		paddingBottom: 72,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		overflow: "hidden",
	},
	heroCircleLg: {
		position: "absolute",
		width: 220,
		height: 220,
		borderRadius: 120,
		backgroundColor: "rgba(255,255,255,0.16)",
		right: -44,
		top: -36,
	},
	heroCircleSm: {
		position: "absolute",
		width: 132,
		height: 132,
		borderRadius: 70,
		backgroundColor: "rgba(255,255,255,0.13)",
		left: -38,
		top: 58,
	},
	heroTopRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	iconRoundButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	heroTextArea: {
		marginTop: 18,
	},
	headerName: {
		fontSize: 34,
		fontWeight: "700",
		textTransform: "capitalize",
		letterSpacing: 0.3,
	},
	headerId: {
		fontWeight: "700",
		fontSize: 15,
	},
	metaRow: {
		marginTop: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	metaPill: {
		borderWidth: 1,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	metaPillText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.2,
	},
	bodyWrap: {
		marginTop: -40,
		paddingHorizontal: 16,
	},
	imagePanel: {
		borderWidth: 1,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		shadowOpacity: 0.18,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 8 },
		elevation: 8,
		marginBottom: 16,
		overflow: "hidden",
	},
	image: {
		width: 280,
		height: 280,
		alignSelf: "center",
		backgroundColor: "transparent",
	},
	typeRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 12,
		alignItems: "center",
	},
	typeBadge: {
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 999,
	},
	typeText: { textTransform: "capitalize", fontWeight: "700", fontSize: 13 },
	section: {
		marginTop: 12,
		borderWidth: 1,
		padding: 14,
		borderRadius: 18,
	},
	sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
	quickFactsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: QUICK_FACT_CARD_GAP,
	},
	factCard: {
		width: "48.4%",
		minHeight: 90,
		borderRadius: 14,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	factLabel: {
		fontSize: 12,
		fontWeight: "600",
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.4,
	},
	factValue: {
		fontWeight: "700",
		fontSize: 22,
	},
	statRow: {
		marginBottom: 12,
	},
	statTextRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	statName: {
		fontWeight: "600",
		fontSize: 13,
	},
	statBarBackground: {
		height: 10,
		borderRadius: 8,
		overflow: "hidden",
	},
	statBarFill: {
		height: 10,
		borderRadius: 8,
	},
	statValue: {
		fontSize: 13,
		fontWeight: "700",
	},
	abilitiesWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	abilityBadge: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
	},
	abilityText: {
		textTransform: "capitalize",
		fontWeight: "600",
		fontSize: 13,
	},
	hiddenAbilityHint: {
		marginTop: 10,
		fontSize: 12,
		fontWeight: "500",
	},
	movesWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	moveChip: {
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1,
	},
	moveChipText: {
		fontSize: 12,
		fontWeight: "600",
	},
});
