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
	provider: string;
	pokemonName: string;
	confidence: number | null;
	reasoning: string;
	raw: string;
	color: string;
};

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

	const panelBg = colors.surface;
	const panelAltBg = colors.surfaceAlt;
	const imageFrameBg =
		theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
	const softTint =
		theme === "dark" ? "rgba(239,83,80,0.12)" : "rgba(239,83,80,0.08)";
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
						setError("Both AI requests failed. Check API keys and network.");
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

	const handleOpenDetails = async () => {
		if (!result || result.pokemonName === "Unknown") {
			Alert.alert("No Pokemon identified", "Try another photo first.");
			return;
		}

		setDetailsLoading(true);
		try {
			const normalizedName = result.pokemonName
				.trim()
				.toLowerCase()
				.replace(/[.'`]/g, "")
				.replace(/\s+/g, "-");

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
		if (!result) {
			return (
				<View
					style={[
						styles.resultCard,
						styles.resultCardMuted,
						{ backgroundColor: panelBg, borderColor: colors.border },
					]}>
					<Text style={[styles.resultProvider, { color: colors.mutedText }]}>
						Unavailable
					</Text>
					<Text style={[styles.resultName, { color: colors.text }]}>
						No response
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
				<Text style={[styles.resultProvider, { color: result.color }]}>
					{result.provider}
				</Text>
				<Text style={[styles.resultName, { color: colors.text }]}>
					{result.pokemonName}
				</Text>
				<Text style={[styles.resultConfidence, { color: colors.mutedText }]}>
					Confidence: {result.confidence ?? "N/A"}
					{typeof result.confidence === "number" ? "%" : ""}
				</Text>
				<Text style={[styles.resultReasoning, { color: colors.mutedText }]}>
					{result.reasoning}
				</Text>
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

				<View style={styles.titleWrap}>
					<Text style={[styles.title, { color: colors.text }]}>
						Pokemon Identification
					</Text>
					<Text style={[styles.subtitle, { color: colors.mutedText }]}>
						AI-powered result with provider fallback
					</Text>
				</View>

				{loading ? (
					<View
						style={[
							styles.loadingBox,
							{ backgroundColor: panelAltBg, borderColor: colors.border },
						]}>
						<ActivityIndicator size="large" color={colors.accent} />
						<Text style={[styles.loadingText, { color: colors.mutedText }]}>
							Analyzing with Gemini (Grok as fallback)...
						</Text>
					</View>
				) : (
					<>
						{error ? (
							<Text style={[styles.errorText, { color: colors.danger }]}>
								{error}
							</Text>
						) : null}

						{result && (
							<View
								style={[
									styles.winnerCard,
									{ backgroundColor: result.color || colors.accent },
								]}>
								<Text style={[styles.winnerLabel, { color: "#1b1b1b" }]}>
									Best Guess ({result.provider})
								</Text>
								<Text style={[styles.winnerName, { color: "#111111" }]}>
									{result.pokemonName}
								</Text>
							</View>
						)}

						<ResultCard result={result} />
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
							opacity: loading || detailsLoading || !result ? 0.6 : 1,
						},
					]}
					onPress={handleOpenDetails}
					disabled={loading || detailsLoading || !result}>
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
	titleWrap: {
		gap: 4,
	},
	title: {
		fontSize: 22,
		fontWeight: "800",
	},
	subtitle: {
		fontSize: 13,
		fontWeight: "500",
	},
	loadingBox: {
		padding: 16,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		gap: 10,
	},
	loadingText: {
		fontSize: 14,
		fontWeight: "500",
	},
	winnerCard: {
		padding: 14,
		borderRadius: 14,
	},
	winnerLabel: {
		fontSize: 12,
		fontWeight: "700",
	},
	winnerName: {
		fontSize: 22,
		fontWeight: "800",
	},
	resultCard: {
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
		gap: 6,
	},
	resultCardMuted: {
		opacity: 0.75,
	},
	resultProvider: {
		fontWeight: "700",
	},
	resultName: {
		fontSize: 20,
		fontWeight: "800",
	},
	resultConfidence: {
		fontWeight: "600",
	},
	resultReasoning: {
		lineHeight: 20,
	},
	errorText: {
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
		fontWeight: "800",
	},
});
