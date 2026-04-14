import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Button,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	FontAwesome6,
	Ionicons,
	MaterialCommunityIcons,
	FontAwesome,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Grid from "@/src/components/Grid";
import CameraResult from "../Screens/CameraResult";
import ImageCaptureResult from "../Screens/ImageCaptureResult";

export default function Camera() {
	const cameraRef = useRef<CameraView | null>(null);
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [flash, setFlash] = useState<"on" | "off">("off");
	const [isCapturing, setIsCapturing] = useState(false);
	const [showGrid, setShowGrid] = useState(false);
	const [photoUri, setPhotoUri] = useState<string | null>(null);
	const [analysisUri, setAnalysisUri] = useState<string | null>(null);

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					Allow camera access to use this feature.
				</Text>
				<Button onPress={requestPermission} title="Grant permission" />
			</View>
		);
	}

	function toggleCameraFacing() {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}

	async function capturePhoto() {
		if (!cameraRef.current || isCapturing) {
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
				<View style={styles.cameraContainer}>
					<CameraView
						ref={cameraRef}
						style={styles.camera}
						facing={facing}
						flash={flash}
					/>
					<View pointerEvents="none" style={styles.frameContainer}>
						<View style={styles.frame}>{showGrid && <Grid />}</View>
					</View>
				</View>
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#292828",
	},
	message: {
		textAlign: "center",
		color: "#1A1A1A",
		fontSize: 16,
		marginBottom: 12,
	},
	cameraContainer: {
		flex: 1,
		position: "relative",
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
		...StyleSheet.absoluteFillObject,
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
