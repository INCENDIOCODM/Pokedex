import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import {
	identifyPokemonWithGemini,
	identifyPokemonWithGrok,
} from "@/src/functions/OpenRouterAPI";
import { featchPokemonData } from "@/src/functions/ApiCalls";

type ProviderResult = {
	pokemonName: string;
	confidence: number | null;
	reasoning?: string;
};

type PokemonSpeciesResponse = {
	flavor_text_entries?: Array<{
		flavor_text?: string;
		language?: { name?: string };
	}>;
};

const toPokemonSlug = (name: string): string =>
	name.trim().toLowerCase().replace(/[.'`]/g, "").replace(/\s+/g, "-");

const normalizeFlavorText = (value: string): string =>
	value
		.replace(/[\f\n\r]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

type ImageCaptureResultProps = {
	photoUri: string;
	onBackToPreview: () => void;
};

const ImageCaptureResult = ({
	photoUri,
	onBackToPreview,
}: ImageCaptureResultProps) => {
	const router = useRouter();
	const { colors, theme } = useTheme();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<ProviderResult | null>(null);
	const [detailsLoading, setDetailsLoading] = useState(false);
	const [funFact, setFunFact] = useState<string | null>(null);
	const [funFactLoading, setFunFactLoading] = useState(false);
	const hasValidResult = Boolean(result && result.pokemonName !== "Unknown");

	const panelBg = colors.surface;
	const panelAltBg = colors.surfaceAlt;
	const imageFrameBg =
		theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
	const funFactCardBg =
		theme === "dark" ? "rgba(255,193,7,0.16)" : "rgba(255,193,7,0.2)";
	const funFactCardBorder =
		theme === "dark" ? "rgba(255,193,7,0.45)" : "rgba(255,152,0,0.35)";
	const secondaryButtonBg =
		theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

	useEffect(() => {
		let cancelled = false;

		const analyze = async () => {
			setLoading(true);
			setError(null);
			setResult(null);
			try {
				try {
					const gemini = await identifyPokemonWithGemini(photoUri);
					if (!cancelled) {
						setResult(gemini);
					}
					return;
				} catch (geminiErr) {
					console.log("Gemini failed, falling back to Grok:", geminiErr);
				}

				try {
					const grok = await identifyPokemonWithGrok(photoUri);
					if (!cancelled) {
						setResult(grok);
					}
					return;
				} catch (grokErr) {
					console.log("Grok fallback also failed:", grokErr);
					if (!cancelled) {
						setError("Could not analyze this photo. Please try again.");
					}
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		analyze();

		return () => {
			cancelled = true;
		};
	}, [photoUri]);

	useEffect(() => {
		let cancelled = false;

		const loadFunFact = async () => {
			if (!hasValidResult || !result) {
				setFunFact(null);
				setFunFactLoading(false);
				return;
			}

			setFunFactLoading(true);
			setFunFact(null);

			try {
				const pokemonSlug = toPokemonSlug(result.pokemonName);
				const response = await fetch(
					`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(pokemonSlug)}`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch species data");
				}

				const species = (await response.json()) as PokemonSpeciesResponse;
				const englishEntries =
					species.flavor_text_entries?.filter(
						(entry) => entry.language?.name === "en" && entry.flavor_text,
					) ?? [];

				if (!cancelled) {
					if (englishEntries.length > 0) {
						const randomIndex = Math.floor(
							Math.random() * englishEntries.length,
						);
						const rawText = englishEntries[randomIndex]?.flavor_text ?? "";
						const cleaned = normalizeFlavorText(rawText);
						setFunFact(cleaned || null);
					} else {
						setFunFact("No fun fact available right now.");
					}
				}
			} catch {
				if (!cancelled) {
					setFunFact("No fun fact available right now.");
				}
			} finally {
				if (!cancelled) {
					setFunFactLoading(false);
				}
			}
		};

		void loadFunFact();

		return () => {
			cancelled = true;
		};
	}, [hasValidResult, result]);

	const handleOpenDetails = async () => {
		if (!hasValidResult || !result) {
			Alert.alert("No Pokemon detected", "Try another photo first.");
			return;
		}

		setDetailsLoading(true);
		try {
			const normalizedName = toPokemonSlug(result.pokemonName);

			const data = await featchPokemonData(
				`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(normalizedName)}`,
			);
			if (!data.id) {
				throw new Error("Pokemon id missing");
			}

			router.push({
				pathname: "/Screens/PokemonDetail",
				params: { pokemonId: String(data.id) },
			});
		} catch {
			Alert.alert(
				"Could not open details",
				"I couldn't map this result to a Pokemon ID. Please try another photo.",
			);
		} finally {
			setDetailsLoading(false);
		}
	};

	const ResultCard = ({ result }: { result: ProviderResult | null }) => {
		if (!result || result.pokemonName === "Unknown") {
			return (
				<View
					style={[
						styles.resultCard,
						{ backgroundColor: panelBg, borderColor: colors.border },
					]}>
					<Text style={[styles.resultLabel, { color: colors.mutedText }]}>
						Result
					</Text>
					<Text style={[styles.resultName, { color: colors.text }]}>
						No match found
					</Text>
					<Text style={[styles.resultHint, { color: colors.mutedText }]}>
						Try another photo for a better result.
					</Text>
				</View>
			);
		}

		return (
			<View
				style={[
					styles.resultCard,
					{ backgroundColor: panelBg, borderColor: colors.border },
				]}>
				<Text style={[styles.resultLabel, { color: colors.mutedText }]}>
					Detected Pokemon
				</Text>
				<Text style={[styles.resultName, { color: colors.text }]}>
					{result.pokemonName}
				</Text>
				{typeof result.confidence === "number" ? (
					<Text style={[styles.resultConfidence, { color: colors.mutedText }]}>
						Match confidence: {Math.round(result.confidence)}%
					</Text>
				) : null}
				{result.reasoning ? (
					<>
						<Text
							style={[styles.descriptionLabel, { color: colors.mutedText }]}>
							Description
						</Text>
						<Text style={[styles.descriptionText, { color: colors.mutedText }]}>
							{result.reasoning}
						</Text>
					</>
				) : null}
			</View>
		);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			<ScrollView contentContainerStyle={styles.content}>
				<View
					style={[
						styles.imageWrapper,
						{
							backgroundColor: imageFrameBg,
							borderColor: colors.border,
						},
					]}>
					<Image source={{ uri: photoUri }} style={styles.imagePreview} />
				</View>

				{loading ? (
					<View
						style={[
							styles.loadingBox,
							{ backgroundColor: panelAltBg, borderColor: colors.border },
						]}>
						<ActivityIndicator size="large" color={colors.accent} />
						<Text style={[styles.loadingText, { color: colors.mutedText }]}>
							Analyzing photo...
						</Text>
					</View>
				) : (
					<>
						{error ? (
							<Text style={[styles.errorText, { color: colors.danger }]}>
								{error}
							</Text>
						) : null}

						<ResultCard result={result} />

						{hasValidResult ? (
							<View
								style={[
									styles.funFactCard,
									{
										backgroundColor: funFactCardBg,
										borderColor: funFactCardBorder,
									},
								]}>
								<View style={styles.funFactHeader}>
									<Ionicons name="sparkles" size={17} color={colors.accent} />
									<Text style={[styles.funFactLabel, { color: colors.accent }]}>
										Fun Fact!
									</Text>
								</View>
								<Text style={[styles.funFactIntro, { color: colors.text }]}>
									Did you know?
								</Text>
								<Text style={[styles.funFactText, { color: colors.text }]}>
									{funFactLoading
										? "Brewing a fun Pokemon fact..."
										: (funFact ??
											"Every Pokemon has unique lore entries across different regions.")}
								</Text>
							</View>
						) : null}
					</>
				)}
			</ScrollView>

			<View
				style={[
					styles.actionsRow,
					{ backgroundColor: panelBg, borderColor: colors.border },
				]}>
				<TouchableOpacity
					style={[
						styles.secondaryButton,
						{ backgroundColor: secondaryButtonBg },
					]}
					onPress={onBackToPreview}>
					<Ionicons name="arrow-back" size={20} color={colors.text} />
					<Text style={[styles.secondaryButtonText, { color: colors.text }]}>
						Back
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.primaryButton,
						{
							backgroundColor: colors.accent,
							opacity: loading || detailsLoading || !hasValidResult ? 0.6 : 1,
						},
					]}
					onPress={handleOpenDetails}
					disabled={loading || detailsLoading || !hasValidResult}>
					{detailsLoading ? (
						<ActivityIndicator size="small" color={colors.onAccent} />
					) : (
						<Ionicons
							name="information-circle"
							size={20}
							color={colors.onAccent}
						/>
					)}
					<Text style={[styles.primaryButtonText, { color: colors.onAccent }]}>
						Details
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default ImageCaptureResult;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
		paddingBottom: 128,
		gap: 12,
	},
	imageWrapper: {
		borderRadius: 20,
		overflow: "hidden",
		borderWidth: 1,
		padding: 6,
	},
	imagePreview: {
		width: "100%",
		height: 260,
		borderRadius: 14,
	},
	loadingBox: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		gap: 10,
	},
	loadingText: {
		fontSize: 15,
		fontWeight: "500",
	},
	resultCard: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		gap: 7,
	},
	resultLabel: {
		fontSize: 13,
		fontWeight: "700",
		letterSpacing: 0.4,
	},
	resultName: {
		fontSize: 24,
		fontWeight: "800",
	},
	resultConfidence: {
		fontSize: 15,
		fontWeight: "600",
	},
	resultHint: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 20,
	},
	descriptionLabel: {
		fontSize: 13,
		fontWeight: "700",
		letterSpacing: 0.3,
		marginTop: 6,
	},
	descriptionText: {
		fontSize: 15,
		lineHeight: 22,
		fontWeight: "500",
	},
	funFactCard: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		gap: 8,
	},
	funFactHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	funFactLabel: {
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.4,
	},
	funFactIntro: {
		fontSize: 17,
		fontWeight: "800",
	},
	funFactText: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: "500",
	},
	errorText: {
		fontSize: 14,
		fontWeight: "700",
	},
	actionsRow: {
		position: "absolute",
		left: 14,
		right: 14,
		bottom: 14,
		padding: 10,
		borderRadius: 16,
		borderWidth: 1,
		flexDirection: "row",
		gap: 10,
	},
	secondaryButton: {
		flex: 1,
		height: 52,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
	},
	secondaryButtonText: {
		fontSize: 15,
		fontWeight: "700",
	},
	primaryButton: {
		flex: 1,
		height: 52,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
	},
	primaryButtonText: {
		fontSize: 15,
		fontWeight: "800",
	},
});
