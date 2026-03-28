import AsyncStorage from "@react-native-async-storage/async-storage";

export const OPENROUTER_API_KEY_STORAGE_KEY = "OPENROUTER_API_KEY";

export type PokemonVisionResult = {
	provider: "Gemini" | "Grok";
	pokemonName: string;
	confidence: number | null;
	reasoning: string;
	raw: string;
	color: string;
};

type ParsedModelResponse = {
	pokemonName?: string;
	confidence?: number;
	reasoning?: string;
	type?: string;
};

type OpenRouterTextPart = {
	text?: string;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_GEMINI_MODEL = "google/gemini-2.5-flash-lite";
const DEFAULT_GROK_MODEL = "x-ai/grok-4.1-fast";

const PROMPT =
	"Identify which Pokemon is shown in this image. Return only JSON with keys: pokemonName (string), confidence (number 0-100), type (the Pokemon's primary type like Fire, Water, Electric, etc.), reasoning (short string). If uncertain, still provide your best guess.";

const TYPE_COLORS: Record<string, string> = {
	Normal: "#A8A878",
	Fire: "#F08030",
	Water: "#6890F0",
	Electric: "#F8D030",
	Grass: "#78C850",
	Ice: "#98D8D8",
	Fighting: "#C03028",
	Poison: "#A040A0",
	Ground: "#E0C068",
	Flying: "#A890F0",
	Psychic: "#F85888",
	Bug: "#A8B820",
	Rock: "#B8A038",
	Ghost: "#705898",
	Dragon: "#7038F8",
	Dark: "#705848",
	Steel: "#B8B8D0",
	Fairy: "#EE99AC",
};

function getColorForType(type?: string): string {
	if (!type) return "#A8A878";
	const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
	return TYPE_COLORS[normalized] ?? "#A8A878";
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(String(reader.result ?? ""));
		reader.onerror = () =>
			reject(new Error("Failed to convert image to base64."));
		reader.readAsDataURL(blob);
	});
}

async function uriToDataUrl(uri: string): Promise<string> {
	const response = await fetch(uri);
	if (!response.ok) {
		throw new Error("Unable to read captured image.");
	}

	const blob = await response.blob();
	return blobToDataUrl(blob);
}

function safeJsonParse(value: string): ParsedModelResponse | null {
	try {
		return JSON.parse(value) as ParsedModelResponse;
	} catch {
		const trimmed = value.trim();

		const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
		if (fencedMatch?.[1]) {
			try {
				return JSON.parse(fencedMatch[1]) as ParsedModelResponse;
			} catch {
				// Keep trying with broader extraction below.
			}
		}

		const firstBrace = trimmed.indexOf("{");
		const lastBrace = trimmed.lastIndexOf("}");
		if (firstBrace !== -1 && lastBrace > firstBrace) {
			const candidate = trimmed.slice(firstBrace, lastBrace + 1);
			try {
				return JSON.parse(candidate) as ParsedModelResponse;
			} catch {
				return null;
			}
		}

		return null;
	}
}

function contentToText(content: unknown): string {
	if (typeof content === "string") {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map((part) => {
				if (typeof part === "string") {
					return part;
				}

				if (
					typeof part === "object" &&
					part !== null &&
					typeof (part as OpenRouterTextPart).text === "string"
				) {
					return (part as OpenRouterTextPart).text as string;
				}

				return "";
			})
			.join("\n");
	}

	return "";
}

function normalizeResult(
	provider: "Gemini" | "Grok",
	text: string,
): PokemonVisionResult {
	const parsed = safeJsonParse(text);
	if (parsed) {
		return {
			provider,
			pokemonName: parsed.pokemonName?.trim() || "Unknown",
			confidence:
				typeof parsed.confidence === "number" &&
				Number.isFinite(parsed.confidence)
					? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
					: null,
			reasoning: parsed.reasoning?.trim() || "No reasoning returned.",
			raw: text,
			color: getColorForType(parsed.type),
		};
	}

	return {
		provider,
		pokemonName: "Unknown",
		confidence: null,
		reasoning: "Could not parse model response as JSON.",
		raw: text,
		color: "#A8A878",
	};
}

async function resolveOpenRouterApiKey(): Promise<string> {
	const stored = await AsyncStorage.getItem(OPENROUTER_API_KEY_STORAGE_KEY);
	if (stored?.trim()) {
		return stored.trim();
	}

	const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
	if (envKey?.trim()) {
		return envKey.trim();
	}

	throw new Error("Missing OpenRouter API key. Set it in Settings.");
}

async function identifyWithOpenRouter(
	provider: "Gemini" | "Grok",
	model: string,
	photoUri: string,
): Promise<PokemonVisionResult> {
	const apiKey = await resolveOpenRouterApiKey();
	const dataUrl = await uriToDataUrl(photoUri);

	const response = await fetch(OPENROUTER_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			temperature: 0.2,
			messages: [
				{
					role: "system",
					content:
						"You are a Pokemon identification assistant. Respond with strict JSON only.",
				},
				{
					role: "user",
					content: [
						{ type: "text", text: PROMPT },
						{ type: "image_url", image_url: { url: dataUrl } },
					],
				},
			],
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`${provider} (OpenRouter) request failed: ${errorText}`);
	}

	const data = (await response.json()) as {
		choices?: Array<{ message?: { content?: unknown } }>;
	};

	const text = contentToText(data.choices?.[0]?.message?.content);
	if (!text.trim()) {
		throw new Error(`${provider} returned an empty response.`);
	}

	return normalizeResult(provider, text);
}

export async function identifyPokemonWithGemini(
	photoUri: string,
): Promise<PokemonVisionResult> {
	return identifyWithOpenRouter("Gemini", DEFAULT_GEMINI_MODEL, photoUri);
}

export async function identifyPokemonWithGrok(
	photoUri: string,
): Promise<PokemonVisionResult> {
	return identifyWithOpenRouter("Grok", DEFAULT_GROK_MODEL, photoUri);
}
