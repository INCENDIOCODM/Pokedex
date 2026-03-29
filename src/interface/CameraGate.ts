export type CameraGateStep = "intro" | "permission" | "apiKey" | "ready";

type ResolveCameraGateStepArgs = {
	hasPermission: boolean;
	hasApiKey: boolean;
};

export function resolveCameraGateStep({
	hasPermission,
	hasApiKey,
}: ResolveCameraGateStepArgs): CameraGateStep {
	if (!hasPermission) {
		return "permission";
	}

	if (!hasApiKey) {
		return "apiKey";
	}

	return "ready";
}
