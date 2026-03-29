import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/src/context/ThemeContext";
import { CameraGateStep } from "@/src/interface/CameraGate";

type CameraGateModalProps = {
	visible: boolean;
	currentStep: CameraGateStep;
	isChecking: boolean;
	onContinueFromIntro: () => Promise<void>;
	onRequestPermission: () => Promise<void>;
	onGetApiKey: () => Promise<void>;
	onSaveApiKey: (apiKey: string) => Promise<boolean>;
	onClose: () => void;
};

type StepViewModel = {
	title: string;
	description: string;
	primaryLabel: string;
	primaryAction: () => Promise<void> | void;
};

export default function CameraGateModal({
	visible,
	currentStep,
	isChecking,
	onContinueFromIntro,
	onRequestPermission,
	onGetApiKey,
	onSaveApiKey,
	onClose,
}: CameraGateModalProps) {
	const { colors } = useTheme();
	const progress = useSharedValue(0);
	const [apiKeyInput, setApiKeyInput] = useState("");
	const [apiKeyError, setApiKeyError] = useState<string | null>(null);

	useEffect(() => {
		progress.value = withTiming(visible ? 1 : 0, {
			duration: 240,
			easing: Easing.out(Easing.cubic),
		});
	}, [progress, visible]);

	useEffect(() => {
		if (currentStep !== "apiKey") {
			setApiKeyError(null);
		}
	}, [currentStep]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: progress.value * 0.66,
	}));

	const cardStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ scale: 0.88 + progress.value * 0.12 }],
	}));

	const step = useMemo<StepViewModel>(() => {
		switch (currentStep) {
			case "permission":
				return {
					title: "Camera Permission Needed",
					description:
						"We need camera permission before you can scan Pokemon. Grant access to continue.",
					primaryLabel: "Grant Permission",
					primaryAction: onRequestPermission,
				};
			case "apiKey":
				return {
					title: "Add Your OpenRouter API Key",
					description:
						"Paste your key below and save it here to unlock camera identification.",
					primaryLabel: "Get API Key",
					primaryAction: onGetApiKey,
				};
			case "ready":
				return {
					title: "You Are Ready",
					description: "Everything is set. Continue to open the camera.",
					primaryLabel: "Continue",
					primaryAction: onClose,
				};
			case "intro":
			default:
				return {
					title: "Pokemon Camera",
					description:
						"Take a photo of a Pokemon to identify it with AI and jump straight into detailed info.",
					primaryLabel: "Continue",
					primaryAction: onContinueFromIntro,
				};
		}
	}, [
		currentStep,
		onClose,
		onContinueFromIntro,
		onGetApiKey,
		onRequestPermission,
	]);

	const handlePrimaryPress = () => {
		void step.primaryAction();
	};

	const handleSaveApiKeyPress = () => {
		setApiKeyError(null);
		if (!apiKeyInput.trim()) {
			setApiKeyError("Paste your OpenRouter key to continue.");
			return;
		}

		void (async () => {
			const wasSaved = await onSaveApiKey(apiKeyInput);
			if (!wasSaved) {
				setApiKeyError("Could not save this key. Try again.");
			}
		})();
	};

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			animationType="none"
			onRequestClose={() => {}}>
			<View style={styles.modalRoot}>
				<Animated.View style={[styles.backdrop, backdropStyle]} />
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.keyboardWrap}>
					<Animated.View
						style={[
							styles.card,
							{ backgroundColor: colors.surface, borderColor: colors.border },
							cardStyle,
						]}>
						<Animated.View
							entering={FadeIn.duration(160)}
							exiting={FadeOut.duration(120)}
							key={currentStep}>
							<Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
							<Text style={[styles.description, { color: colors.mutedText }]}>
								{step.description}
							</Text>

							{isChecking ? (
								<View style={styles.progressRow}>
									<ActivityIndicator color={colors.accent} size="small" />
									<Text style={[styles.progressText, { color: colors.mutedText }]}>
										Checking requirements...
									</Text>
								</View>
							) : null}

							{currentStep === "apiKey" ? (
								<View>
									<TextInput
										value={apiKeyInput}
										onChangeText={setApiKeyInput}
										placeholder="Paste OpenRouter key (sk-or-v1-...)"
										placeholderTextColor={colors.mutedText}
										autoCapitalize="none"
										autoCorrect={false}
										style={[
											styles.keyInput,
											{
												color: colors.text,
												borderColor: colors.border,
												backgroundColor: colors.surfaceAlt,
											},
										]}
									/>
									{apiKeyError ? (
										<Text style={[styles.errorText, { color: colors.danger }]}>
											{apiKeyError}
										</Text>
									) : null}
								</View>
							) : null}
						</Animated.View>

						<Pressable
							disabled={isChecking}
							onPress={handlePrimaryPress}
							style={({ pressed }) => [
								styles.primaryButton,
								{ backgroundColor: colors.accent },
								pressed && styles.primaryPressed,
								isChecking && styles.disabled,
							]}>
							<Text style={[styles.primaryText, { color: colors.onAccent }]}>
								{step.primaryLabel}
							</Text>
						</Pressable>

						{currentStep === "apiKey" ? (
							<Pressable
								disabled={isChecking}
								onPress={handleSaveApiKeyPress}
								style={({ pressed }) => [
									styles.secondaryButton,
									{
										borderColor: colors.border,
										backgroundColor: colors.surfaceAlt,
									},
									pressed && styles.secondaryPressed,
									isChecking && styles.disabled,
								]}>
								<Text style={[styles.secondaryText, { color: colors.text }]}>
									Save API Key
								</Text>
							</Pressable>
						) : null}
					</Animated.View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalRoot: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	keyboardWrap: {
		width: "100%",
		alignItems: "center",
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "#000000",
	},
	card: {
		width: "100%",
		maxWidth: 420,
		borderRadius: 18,
		borderWidth: 1,
		paddingHorizontal: 18,
		paddingTop: 20,
		paddingBottom: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.28,
		shadowRadius: 16,
		elevation: 10,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		marginBottom: 8,
	},
	description: {
		fontSize: 15,
		lineHeight: 22,
		marginBottom: 14,
	},
	progressRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	progressText: {
		fontSize: 13,
		fontWeight: "500",
	},
	primaryButton: {
		minHeight: 46,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 4,
	},
	primaryPressed: {
		opacity: 0.9,
	},
	primaryText: {
		fontSize: 15,
		fontWeight: "700",
	},
	keyInput: {
		height: 46,
		borderRadius: 10,
		borderWidth: 1,
		paddingHorizontal: 12,
		marginBottom: 8,
	},
	errorText: {
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 6,
	},
	secondaryButton: {
		minHeight: 44,
		borderRadius: 12,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	secondaryPressed: {
		opacity: 0.9,
	},
	secondaryText: {
		fontSize: 14,
		fontWeight: "600",
	},
	disabled: {
		opacity: 0.6,
	},
});
