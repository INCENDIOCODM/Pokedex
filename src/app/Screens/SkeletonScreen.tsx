import React, { memo, useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import {
	SkeletonScreenProps,
	SkeletonBlockProps,
} from "../../typings/SkeletonScreenTypes";
import SearchBar from "@/src/components/SearchBar";

const SkeletonBlock = memo(function SkeletonBlock({
	width = "100%" as `${number}%`,
	height,
	radius = 12,
	style,
	delay = 0,
}: SkeletonBlockProps) {
	return (
		<MotiView
			from={{ opacity: 0.45 }}
			animate={{ opacity: 1 }}
			transition={{
				type: "timing",
				duration: 750,
				loop: true,
				repeatReverse: true,
				delay,
			}}
			style={[{
							width,
							height,
							borderRadius: radius,
							backgroundColor: "#E6E6E6",
							}, style
			]}
		/>
	);
});

function HomeSkeleton({ rows, count }: Required<Pick<SkeletonScreenProps, "rows" | "count">>) {
	const cardBasis = rows === 2 ? "49%" : "95%";
	const items = useMemo(
		() => Array.from({ length: count }, (_, i) => i),
		[count]
	);

	return (
		<View style={styles.container}>
			<SearchBar />
			<View style={styles.countContainer}>
				<SkeletonBlock width={110} height={16} radius={8} />
			</View>

			<ScrollView
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}>
				<View style={styles.grid}>
					{items.map((i) => (
						<View key={i} style={[styles.cardOuter, { flexBasis: cardBasis }]}>
							<View style={styles.card}>
								<SkeletonBlock
									width={150}
									height={150}
									radius={20}
									delay={(i % 6) * 60}
									style={{ alignSelf: "center" }}
								/>
								<View style={{ height: 12 }} />
								<SkeletonBlock
									width={rows === 2 ? 90 : 140}
									height={18}
									radius={10}
									delay={(i % 6) * 60 + 40}
									style={{ alignSelf: "center" }}
								/>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}

function DetailSkeleton() {
	const screenWidth = Dimensions.get("window").width;
	const imageSize = Math.min(260, screenWidth - 60);
	const statRows = useMemo(() => [0, 1, 2, 3, 4], []);

	return (
		<ScrollView
			contentContainerStyle={styles.detailContainer}
			showsVerticalScrollIndicator={false}>
			<View style={styles.detailHeader}>
				<SkeletonBlock
					width={36}
					height={36}
					radius={12}
					style={{ position: "absolute", left: 12, top: 48 }}
				/>
				<SkeletonBlock
					width={180}
					height={26}
					radius={10}
					style={{ marginTop: 52 }}
				/>
				<SkeletonBlock
					width={60}
					height={18}
					radius={9}
					style={{ position: "absolute", right: 12, top: 56 }}
				/>
			</View>

			<View style={styles.detailCardArea}>
				<View style={styles.detailCardContent}>
					<SkeletonBlock
						width={imageSize}
						height={imageSize}
						radius={22}
						style={{ alignSelf: "center" }}
					/>
					<View style={{ height: 10 }} />
					<View
						style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
						<SkeletonBlock width={90} height={28} radius={16} />
						<SkeletonBlock width={90} height={28} radius={16} delay={50} />
					</View>
				</View>

				<View style={styles.detailSection}>
					<View style={{ alignItems: "center" }}>
						<SkeletonBlock width={90} height={20} radius={10} />
					</View>
					<View style={styles.aboutRow}>
						{[0, 1, 2].map((i) => (
							<View key={i} style={styles.aboutBox}>
								<SkeletonBlock
									width={40}
									height={12}
									radius={6}
									delay={i * 40}
									style={{ alignSelf: "center" }}
								/>
								<View style={{ height: 10 }} />
								<SkeletonBlock
									width={55}
									height={18}
									radius={9}
									delay={i * 40 + 50}
									style={{ alignSelf: "center" }}
								/>
							</View>
						))}
					</View>
				</View>

				<View style={styles.detailSection}>
					<View style={{ alignItems: "center" }}>
						<SkeletonBlock width={70} height={20} radius={10} />
					</View>
					<View style={{ height: 10 }} />
					{statRows.map((i) => (
						<View key={i} style={styles.statRow}>
							<SkeletonBlock width={80} height={14} radius={8} delay={i * 35} />
							<SkeletonBlock
								width="55%"
								height={12}
								radius={8}
								delay={i * 35 + 25}
								style={{ backgroundColor: "#EFEFEF" }}
							/>
							<SkeletonBlock
								width={28}
								height={14}
								radius={8}
								delay={i * 35 + 40}
							/>
						</View>
					))}
				</View>

				<View style={styles.detailSection}>
					<SkeletonBlock width={90} height={20} radius={10} />
					<View style={{ height: 10 }} />
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
						{[0, 1, 2].map((i) => (
							<SkeletonBlock
								key={i}
								width={110}
								height={28}
								radius={14}
								delay={i * 50}
							/>
						))}
					</View>
				</View>

				<View style={{ height: 60 }} />
			</View>
		</ScrollView>
	);
}

const SkeletonScreen = ({
	variant = "home",
	rows = 2,
	count = 8,
}: SkeletonScreenProps) => {
	if (variant === "detail") return <DetailSkeleton />;
	return <HomeSkeleton rows={rows} count={count} />;
};

export default SkeletonScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	headerContainer: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	toolbarContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 10,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	searchBarWrapper: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	toggleButton: {
		width: 56,
		height: 56,
		borderRadius: 14,
		backgroundColor: "#EF5350",
		justifyContent: "center",
		alignItems: "center",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3,
	},
	countContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	listContent: {
		paddingBottom: 24,
		paddingTop: 8,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		paddingHorizontal: 10,
	},
	cardOuter: {
		margin: 1,
	},
	card: {
		padding: 20,
		alignItems: "center",
		margin: 10,
		borderRadius: 25,
		backgroundColor: "#fff",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},

	detailContainer: {
		flexGrow: 1,
		backgroundColor: "#f6f6f6",
	},
	detailHeader: {
		paddingTop: 48,
		paddingBottom: 24,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#D9D9D9",
	},
	detailCardArea: {
		marginTop: -40,
		paddingHorizontal: 20,
		position: "relative",
	},
	detailCardContent: {
		paddingTop: 6,
	},
	detailSection: {
		marginTop: 18,
		backgroundColor: "#fff",
		padding: 12,
		borderRadius: 12,
		elevation: 2,
		justifyContent: "center",
		alignItems: "stretch",
	},
	aboutRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		width: "100%",
		paddingVertical: 6,
	},
	aboutBox: {
		width: 110,
		height: 110,
		borderRadius: 14,
		borderWidth: 2,
		borderColor: "#e6e6e6",
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	statRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
		marginVertical: 6,
	}
});
