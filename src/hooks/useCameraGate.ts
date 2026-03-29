import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import { create } from "zustand";
import { OPENROUTER_API_KEY_STORAGE_KEY } from "@/src/functions/OpenRouterAPI";
import {
	CameraGateStep,
	resolveCameraGateStep,
} from "@/src/interface/CameraGate";

type CameraGateStore = {
	isOpen: boolean;
	isReady: boolean;
	hasApiKey: boolean;
	currentStep: CameraGateStep;
	setIsOpen: (next: boolean) => void;
	setIsReady: (next: boolean) => void;
	setCurrentStep: (next: CameraGateStep) => void;
	setHasApiKey: (next: boolean) => void;
};

const useCameraGateStore = create<CameraGateStore>((set) => ({
	isOpen: false,
	isReady: false,
	hasApiKey: false,
	currentStep: "intro",
	setIsOpen: (next) => set({ isOpen: next }),
	setIsReady: (next) => set({ isReady: next }),
	setCurrentStep: (next) => set({ currentStep: next }),
	setHasApiKey: (next) => set({ hasApiKey: next }),
}));

function hasSavedApiKey(value: string | null): boolean {
	return Boolean(value?.trim());
}

async function evaluateRequirements() {
	const permission = await Camera.getCameraPermissionsAsync();
	const storedApiKey = await AsyncStorage.getItem(OPENROUTER_API_KEY_STORAGE_KEY);
	const hasApiKey = hasSavedApiKey(storedApiKey);
	const nextStep = resolveCameraGateStep({
		hasPermission: Boolean(permission.granted),
		hasApiKey,
	});

	return {
		nextStep,
		hasApiKey,
	};
}

export type UseCameraGateResult = {
	isReady: boolean;
	currentStep: CameraGateStep;
	isOpen: boolean;
	isChecking: boolean;
	open: () => void;
	close: () => void;
	refresh: () => Promise<CameraGateStep>;
	continueFromIntro: () => Promise<void>;
	requestPermission: () => Promise<void>;
	saveApiKey: (apiKey: string) => Promise<boolean>;
};

export function useCameraGate(): UseCameraGateResult {
	const isOpen = useCameraGateStore((state) => state.isOpen);
	const isReady = useCameraGateStore((state) => state.isReady);
	const currentStep = useCameraGateStore((state) => state.currentStep);
	const setIsOpen = useCameraGateStore((state) => state.setIsOpen);
	const setIsReady = useCameraGateStore((state) => state.setIsReady);
	const setCurrentStep = useCameraGateStore((state) => state.setCurrentStep);
	const setHasApiKey = useCameraGateStore((state) => state.setHasApiKey);
	const [isChecking, setIsChecking] = useState(true);

	const applyStep = useCallback(
		(step: CameraGateStep, hasApiKey: boolean) => {
			setHasApiKey(hasApiKey);
			setCurrentStep(step);

			if (step === "ready") {
				setIsReady(true);
				setIsOpen(false);
				return;
			}

			setIsReady(false);
		},
		[setCurrentStep, setHasApiKey, setIsOpen, setIsReady],
	);

	const refresh = useCallback(async () => {
		try {
			const { nextStep, hasApiKey } = await evaluateRequirements();
			applyStep(nextStep, hasApiKey);
			return nextStep;
		} catch (error) {
			console.warn("Failed to evaluate camera gate requirements", error);
			applyStep("permission", false);
			return "permission";
		}
	}, [applyStep]);

	const open = useCallback(() => {
		if (useCameraGateStore.getState().isOpen) {
			return;
		}

		setIsOpen(true);
		setCurrentStep("intro");
		setIsReady(false);
	}, [setCurrentStep, setIsOpen, setIsReady]);

	const close = useCallback(() => {
		setIsOpen(false);
	}, [setIsOpen]);

	const runCheckAndKeepOpenIfBlocked = useCallback(async () => {
		const step = await refresh();
		if (step !== "ready") {
			setIsOpen(true);
		}
		return step;
	}, [refresh, setIsOpen]);

	const continueFromIntro = useCallback(async () => {
		setIsChecking(true);
		try {
			await runCheckAndKeepOpenIfBlocked();
		} finally {
			setIsChecking(false);
		}
	}, [runCheckAndKeepOpenIfBlocked]);

	const requestPermission = useCallback(async () => {
		setIsChecking(true);
		try {
			const permissionResult = await Camera.requestCameraPermissionsAsync();
			if (!permissionResult.granted) {
				applyStep("permission", false);
				setIsOpen(true);
				return;
			}

			await runCheckAndKeepOpenIfBlocked();
		} catch (error) {
			console.warn("Failed to request camera permission", error);
			applyStep("permission", false);
			setIsOpen(true);
		} finally {
			setIsChecking(false);
		}
	}, [applyStep, runCheckAndKeepOpenIfBlocked, setIsOpen]);

	const saveApiKey = useCallback(async (apiKey: string) => {
		const trimmedKey = apiKey.trim();
		if (!trimmedKey) {
			applyStep("apiKey", false);
			setIsOpen(true);
			return false;
		}

		setIsChecking(true);
		try {
			await AsyncStorage.setItem(OPENROUTER_API_KEY_STORAGE_KEY, trimmedKey);
			await runCheckAndKeepOpenIfBlocked();
			return true;
		} catch (error) {
			console.warn("Failed to save OpenRouter API key", error);
			applyStep("apiKey", false);
			setIsOpen(true);
			return false;
		} finally {
			setIsChecking(false);
		}
	}, [applyStep, runCheckAndKeepOpenIfBlocked, setIsOpen]);

	useEffect(() => {
		let mounted = true;

		const bootstrap = async () => {
			setIsChecking(true);
			await refresh();
			if (mounted) {
				setIsChecking(false);
			}
		};

		void bootstrap();

		return () => {
			mounted = false;
		};
	}, [refresh]);

	return {
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
	};
}
