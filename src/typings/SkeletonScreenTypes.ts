import { type ViewStyle } from "react-native";

type SkeletonVariant = "home" | "detail";

type SkeletonScreenProps = {
	variant?: SkeletonVariant;
	rows?: 1 | 2;
	count?: number;
};

type SkeletonBlockProps = {
	width?: number | `${number}%`;
	height: number;
	radius?: number;
	style?: ViewStyle;
	delay?: number;
};

export { SkeletonScreenProps, SkeletonBlockProps };