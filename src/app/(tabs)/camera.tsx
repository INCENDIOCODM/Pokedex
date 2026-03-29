import { CameraView, CameraType } from "expo-camera";
import { useCallback, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
	FontAwesome6,
	Ionicons,
	MaterialCommunityIcons,
	FontAwesome,
} from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import Grid from "@/src/components/Grid";
import CameraGateModal from "@/src/components/CameraGateModal";
import { useCameraGate } from "@/src/hooks/useCameraGate";
import CameraResult from "../Screens/CameraResult";
import ImageCaptureResult from "../Screens/ImageCaptureResult";

export default function Camera() {
	const cameraRef = useRef<CameraView | null>(null);
	const [facing, setFacing] = useState<CameraType>("back");
	const [flash, setFlash] = useState<"on" | "off">("off");
	const [isCapturing, setIsCapturing] = useState(false);
	const [showGrid, setShowGrid] = useState(false);
	const [photoUri, setPhotoUri] = useState<string | null>(null);
	const [analysisUri, setAnalysisUri] = useState<string | null>(null);
	const {
		isReady,
		currentStep,
		isOpen,
		isChecking,
		open,
		close,
		refresh,
		continueFromIntro,
		requestPermission,
		saveApiKey,
	} = useCameraGate();

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			const syncGate = async () => {
				const step = await refresh();
				if (!isActive) {
					return;
				}

				if (step === "ready") {
					close();
					return;
				}

				open();
			};

			void syncGate();

			return () => {
				isActive = false;
			};
		}, [close, open, refresh]),
	);

	function toggleCameraFacing() {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}

	async function capturePhoto() {
		if (!isReady || !cameraRef.current || isCapturing) {
			return;
		}

		try {
			setIsCapturing(true);
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.9,
				skipProcessing: true,
			});

			if (photo?.uri) {
				setPhotoUri(photo.uri);
			}
		} catch {
			// Keep UI responsive even if capture fails.
		} finally {
			setIsCapturing(false);
		}
	}

	const handleGetApiKey = useCallback(async () => {
		const apiKeyUrl = "https://openrouter.ai/keys";
		try {
			const canOpen = await Linking.canOpenURL(apiKeyUrl);
			if (!canOpen) {
				Alert.alert(
					"Link unavailable",
					"Open https://openrouter.ai/keys in your browser.",
				);
				return;
			}

			await Linking.openURL(apiKeyUrl);
		} catch {
			Alert.alert(
				"Unable to open link",
				"Open https://openrouter.ai/keys in your browser.",
			);
		}
	}, []);

	const cameraGateModal = (
		<CameraGateModal
			visible={isOpen}
			currentStep={currentStep}
			isChecking={isChecking}
			onContinueFromIntro={continueFromIntro}
			onRequestPermission={requestPermission}
			onGetApiKey={handleGetApiKey}
			onSaveApiKey={saveApiKey}
			onClose={close}
		/>
	);

	if (analysisUri) {
		return (
			<ImageCaptureResult
				photoUri={analysisUri}
				onBackToPreview={() => setAnalysisUri(null)}
			/>
		);
	}

	if (photoUri) {
		return (
			<CameraResult
				photoUri={photoUri}
				onRetake={() => setPhotoUri(null)}
				onUsePhoto={() => {
					setAnalysisUri(photoUri);
					setPhotoUri(null);
				}}
			/>
		);
	}

	if (!isReady) {
		return (
			<View style={styles.container}>
				<View style={styles.blockedContainer}>
					<Text style={styles.blockedTitle}>Camera setup required</Text>
					<Text style={styles.blockedDescription}>
						Complete the setup steps to unlock camera capture.
					</Text>
					<Pressable
						onPress={open}
						style={({ pressed }) => [
							styles.restartSetupButton,
							pressed && styles.restartSetupButtonPressed,
						]}>
						<Text style={styles.restartSetupButtonText}>Resume setup</Text>
					</Pressable>
					{isChecking ? <ActivityIndicator size="small" color="#EF5350" /> : null}
				</View>
				{cameraGateModal}
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.overlay}>
				<View style={styles.topBar}>
					<TouchableOpacity
						style={styles.controlChip}
						onPress={() => setShowGrid((prev) => !prev)}>
						<MaterialCommunityIcons
							name={showGrid ? "grid" : "grid-off"}
							size={18}
							color={showGrid ? "#A8FFE0" : "#FFFFFF"}
						/>
						<Text style={styles.controlText}>
							{showGrid ? "Grid on" : "Grid off"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.controlChip}
						onPress={() =>
							setFlash((value) => (value === "on" ? "off" : "on"))
						}>
						<Ionicons
							name={flash === "on" ? "flash" : "flash-off"}
							size={18}
							color="#FFFFFF"
						/>
						<Text style={styles.controlText}>
							{flash === "on" ? "Flash on" : "Flash off"}
						</Text>
					</TouchableOpacity>
				</View>
				<CameraView
					ref={cameraRef}
					style={styles.camera}
					facing={facing}
					flash={flash}>
					<View style={styles.frameContainer}>
						<View style={styles.frame}>{showGrid && <Grid />}</View>
					</View>
				</CameraView>
				<View style={styles.bottomPanel}>
					<View style={styles.captureRow}>
						<TouchableOpacity
							style={styles.iconButton}
							onPress={toggleCameraFacing}>
							<Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
						</TouchableOpacity>

						{/* Shutter Button */}
						<TouchableOpacity
							style={styles.captureButtonOuter}
							onPress={capturePhoto}
							disabled={isCapturing}>
							<View style={styles.captureButtonInner}>
								{isCapturing ? (
									<ActivityIndicator size="small" color="#001E3D" />
								) : (
									<FontAwesome name="circle-o" size={40} color="#001E3D" />
								)}
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.iconButton}
							onPress={() => {
								Alert.alert(
									"I added this for fun",
									"Will add something in future updates :)",
								);
								console.log("Easter Egg 🐣🥚");
							}}>
							<FontAwesome6 name="circle-radiation" size={26} color="#FFFFFF" />
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
			{cameraGateModal}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#292828",
	},
	blockedContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		gap: 10,
	},
	blockedTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#F4F4F4",
		textAlign: "center",
	},
	blockedDescription: {
		fontSize: 15,
		color: "#C8C8C8",
		textAlign: "center",
		lineHeight: 22,
	},
	restartSetupButton: {
		marginTop: 8,
		backgroundColor: "#EF5350",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 10,
	},
	restartSetupButtonPressed: {
		opacity: 0.86,
	},
	restartSetupButtonText: {
		color: "#FFFFFF",
		fontWeight: "700",
		fontSize: 14,
	},
	camera: {
		flex: 1,
		borderRadius: 20,
	},
	overlay: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: 8,
		paddingBottom: 10,
		backgroundColor: "rgba(0, 0, 0, 0.26)",
	},
	topBar: {
		marginTop: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 10,
		paddingBottom: 12,
	},
	controlChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.25)",
		backgroundColor: "rgba(12,18,28,0.6)",
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	controlText: {
		color: "#FFFFFF",
		fontSize: 13,
		fontWeight: "600",
	},
	frameContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	frame: {
		position: "absolute",
		borderWidth: 2,
		borderColor: "rgba(255,255,255,0.8)",
		borderRadius: 18,
		overflow: "hidden",
		width: "99%",
		height: "99%",
	},
	bottomPanel: {
		paddingTop: 20,
	},
	captureRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		paddingHorizontal: 25,
	},
	iconButton: {
		width: 50,
		height: 50,
		borderRadius: 56,
		backgroundColor: "rgba(16,22,34,0.68)",
		borderWidth: 1.5,
		borderColor: "rgba(255,255,255,0.25)",
		justifyContent: "center",
		alignItems: "center",
	},
	captureButtonOuter: {
		width: 80,
		height: 80,
		borderRadius: 43,
		borderWidth: 5,
		borderColor: "#393333",
		justifyContent: "center",
		alignItems: "center",
	},
	captureButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 35,
		backgroundColor: "#EAF9FF",
		justifyContent: "center",
		alignItems: "center",
	},
});
