import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Home from "./Home";
import Favorites from "./Favorites";
import { useTheme } from "@/src/context/ThemeContext";

interface HomeTabsProps {
	pokemons: any[];
	fetchMorePokemons: () => void;
	rows: number;
	loadingMore: boolean;
	setRows: (rows: number) => void;
}

const HomeTabs = ({
	pokemons,
	fetchMorePokemons,
	rows,
	loadingMore,
	setRows,
}: HomeTabsProps) => {
	const { colors } = useTheme();
	const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
	const [refreshKey, setRefreshKey] = useState(0);

	const handleRefreshFavorites = () => {
		setRefreshKey((prev) => prev + 1);
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Tab Bar */}
			<View
				style={[
					styles.tabBar,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<TouchableOpacity
					onPress={() => setActiveTab("all")}
					style={[
						styles.tab,
						{
							borderBottomColor:
								activeTab === "all" ? "#EF5350" : "transparent",
						},
					]}>
					<Text
						style={[
							styles.tabText,
							{
								color: activeTab === "all" ? "#EF5350" : colors.mutedText,
								fontWeight: activeTab === "all" ? "700" : "600",
							},
						]}>
						All Pokémon
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => setActiveTab("favorites")}
					style={[
						styles.tab,
						{
							borderBottomColor:
								activeTab === "favorites" ? "#EF5350" : "transparent",
						},
					]}>
					<Text
						style={[
							styles.tabText,
							{
								color: activeTab === "favorites" ? "#EF5350" : colors.mutedText,
								fontWeight: activeTab === "favorites" ? "700" : "600",
							},
						]}>
						Favorites ❤️
					</Text>
				</TouchableOpacity>
			</View>

			{/* Content */}
			<View style={styles.content}>
				{activeTab === "all" && (
					<Home
						pokemons={pokemons}
						fetchMorePokemons={fetchMorePokemons}
						rows={rows}
						loadingMore={loadingMore}
						setRows={setRows}
						onFavoriteChange={handleRefreshFavorites}
					/>
				)}
				{activeTab === "favorites" && <Favorites refreshTrigger={refreshKey} />}
			</View>
		</View>
	);
};

export default HomeTabs;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	tabBar: {
		flexDirection: "row",
		borderBottomWidth: 1,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderBottomWidth: 3,
	},
	tabText: {
		fontSize: 14,
		letterSpacing: 0.3,
	},
	content: {
		flex: 1,
	},
});
