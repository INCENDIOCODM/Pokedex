import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import typeColors from "../../components/Pokemontype/poketype";

export default function PokemonDetails() {
	const { data } = useLocalSearchParams<{ data: string }>();
	const router = useRouter();

	let pokemon: any | null = null;
	try {
		if (data) pokemon = JSON.parse(data as string);
	} catch (e) {
		console.warn("Failed to parse pokemon data", e);
	}

	if (!pokemon) {
		return (
			<View style={styles.center}>
				<Text style={{ fontSize: 16 }}>No Pokémon data available</Text>
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
	const hp = pokemon.stats?.find((s: any) => s.stat.name === "hp")?.base_stat;

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
				{ backgroundColor: "#f6f6f6" },
			]}>
			<View style={[styles.header, { backgroundColor: bg }]}>
				<Pressable onPress={() => router.back()} style={styles.backPress}>
					<Text style={styles.backText}>←</Text>
				</Pressable>
				<Text style={styles.headerName}>{pokemon.name}</Text>
				<Text style={styles.headerId}>#{pokemon.id}</Text>
			</View>

			<View style={styles.cardArea}>
				{bgEmoji ? (
					<View style={styles.emojiBg} pointerEvents="none">
						<Text style={styles.emojiText}>
							{Array(8).fill(bgEmoji).join(" ")}
						</Text>
					</View>
				) : null}
				<View style={styles.cardContent}>
					<Image
						source={{
							uri:
								pokemon.sprites?.other?.["official-artwork"]?.front_default ||
								pokemon.sprites?.front_default,
						}}
						style={styles.image}
					/>

					<View style={styles.typeRow}>
						{pokemon.types?.map((t: any) => (
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

				<View style={styles.section}>
					<View style={{ alignItems: "center" }}>
						<Text style={styles.sectionTitle}>About</Text>
					</View>
					<View style={styles.aboutRow}>
						<View style={styles.aboutBox}>
							<Text style={styles.aboutBoxLabel}>HP</Text>
							<Text style={styles.aboutBoxValue}>{hp ?? "—"}</Text>
						</View>
						<View style={styles.aboutBox}>
							<Text style={styles.aboutBoxLabel}>Height</Text>
							<Text style={styles.aboutBoxValue}>{pokemon.height ?? "—"}</Text>
						</View>
						<View style={styles.aboutBox}>
							<Text style={styles.aboutBoxLabel}>Weight</Text>
							<Text style={styles.aboutBoxValue}>{pokemon.weight ?? "—"}</Text>
						</View>
					</View>
				</View>

				<View style={styles.section}>
					<View style={{ alignItems: "center" }}>
						<Text style={styles.sectionTitle}>Stats</Text>
					</View>
					{pokemon.stats?.map((s: any) =>
						s.stat.name === "hp" ? null : (
							<View key={s.stat.name} style={styles.statRow}>
								<Text style={styles.statName}>
									{s.stat.name.replace("-", " ")}
								</Text>
								<View style={styles.statBarBackground}>
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
								<Text style={styles.statValue}>{s.base_stat}</Text>
							</View>
						)
					)}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Abilities</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
						{pokemon.abilities?.map((ab: any) => (
							<View key={ab.ability.name} style={styles.abilityBadge}>
								<Text style={styles.abilityText}>{ab.ability.name}</Text>
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
