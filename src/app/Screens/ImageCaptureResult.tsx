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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<ProviderResult | null>(null);
	const [detailsLoading, setDetailsLoading] = useState(false);

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
				<View style={[styles.resultCard, styles.resultCardMuted]}>
					<Text style={styles.resultProvider}>Unavailable</Text>
					<Text style={styles.resultName}>No response</Text>
				</View>
			);
		}

		return (
			<View style={styles.resultCard}>
				<Text style={[styles.resultProvider, { color: result.color }]}>
					{result.provider}
				</Text>
				<Text style={styles.resultName}>{result.pokemonName}</Text>
				<Text style={styles.resultConfidence}>
					Confidence: {result.confidence ?? "N/A"}
					{typeof result.confidence === "number" ? "%" : ""}
				</Text>
				<Text style={styles.resultReasoning}>{result.reasoning}</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.imageWrapper}>
					<Image source={{ uri: photoUri }} style={styles.imagePreview} />
				</View>

				<Text style={styles.title}>Pokemon Identification</Text>

				{loading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator size="large" color="#A8FFE0" />
						<Text style={styles.loadingText}>
							Analyzing with Gemini (Grok as fallback)...
						</Text>
					</View>
				) : (
					<>
						{error ? <Text style={styles.errorText}>{error}</Text> : null}

						{result && (
							<View
								style={[styles.winnerCard, { backgroundColor: result.color }]}>
								<Text style={styles.winnerLabel}>
									Best Guess ({result.provider})
								</Text>
								<Text style={styles.winnerName}>{result.pokemonName}</Text>
							</View>
						)}

						<ResultCard result={result} />
					</>
				)}
			</ScrollView>

			<View style={styles.actionsRow}>
				<TouchableOpacity
					style={styles.secondaryButton}
					onPress={onBackToPreview}>
					<Ionicons name="arrow-back" size={20} color="#FFFFFF" />
					<Text style={styles.secondaryButtonText}>Back</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.primaryButton}
					onPress={handleOpenDetails}
					disabled={loading || detailsLoading || !result}>
					{detailsLoading ? (
						<ActivityIndicator size="small" color="#001E3D" />
					) : (
						<Ionicons name="information-circle" size={20} color="#001E3D" />
					)}
					<Text style={styles.primaryButtonText}>Details</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default ImageCaptureResult;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0A0F16",
	},
	content: {
		padding: 14,
		paddingBottom: 120,
		gap: 12,
	},
	imageWrapper: {
		borderRadius: 18,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.15)",
	},
	imagePreview: {
		width: "100%",
		height: 260,
	},
	title: {
		fontSize: 22,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	loadingBox: {
		padding: 18,
		borderRadius: 14,
		backgroundColor: "rgba(168,255,224,0.08)",
		borderWidth: 1,
		borderColor: "rgba(168,255,224,0.3)",
		alignItems: "center",
		gap: 10,
	},
	loadingText: {
		color: "#D9FBEF",
		fontSize: 14,
	},
	winnerCard: {
		padding: 14,
		borderRadius: 14,
		backgroundColor: "#A8FFE0",
	},
	winnerLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: "#003026",
	},
	winnerName: {
		fontSize: 22,
		fontWeight: "800",
		color: "#001E3D",
	},
	resultCard: {
		padding: 14,
		borderRadius: 14,
		backgroundColor: "#121C2A",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.12)",
		gap: 6,
	},
	resultCardMuted: {
		opacity: 0.75,
	},
	resultProvider: {
		color: "#A8FFE0",
		fontWeight: "700",
	},
	resultName: {
		fontSize: 20,
		fontWeight: "800",
		color: "#FFFFFF",
	},
	resultConfidence: {
		color: "#D2D9E4",
		fontWeight: "600",
	},
	resultReasoning: {
		color: "#B9C2CF",
		lineHeight: 20,
	},
	errorText: {
		color: "#FF9C9C",
		fontWeight: "700",
	},
	actionsRow: {
		position: "absolute",
		left: 12,
		right: 12,
		bottom: 16,
		flexDirection: "row",
		gap: 10,
	},
	secondaryButton: {
		flex: 1,
		height: 52,
		borderRadius: 14,
		backgroundColor: "rgba(255,255,255,0.18)",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
	},
	secondaryButtonText: {
		color: "#FFFFFF",
		fontWeight: "700",
	},
	primaryButton: {
		flex: 1,
		height: 52,
		borderRadius: 14,
		backgroundColor: "#A8FFE0",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
	},
	primaryButtonText: {
		color: "#001E3D",
		fontWeight: "800",
	},
});
