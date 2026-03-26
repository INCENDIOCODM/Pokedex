import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import PokeCard from "../../components/pokeCard";

import SearchBar from "../../components/SearchBar";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";

const Home = ({
	pokemons,
	fetchMorePokemons,
	rows,
	loadingMore,
	setRows,
	onFavoriteChange,
}: any) => {
	const router = useRouter();
	const { colors } = useTheme();
	const [searchQuery, setSearchQuery] = useState("");

	const normalizedRows: 1 | 2 = Number(rows) === 1 ? 1 : 2;
	const isInitialLoading = !Array.isArray(pokemons) || pokemons.length === 0;

	const filteredPokemons = pokemons.filter((pokemon: any) =>
		pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<SearchBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				rows={normalizedRows}
				setRows={setRows}
				onPressSettings={() => router.push("../Screens/Settings")}
			/>

			{/* Pokemon Count Badge */}
			<View
				style={[
					styles.countContainer,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<Text style={[styles.countText, { color: colors.mutedText }]}>
					{filteredPokemons.length} Pokémon
				</Text>
			</View>

			{/* FlatList */}
			<FlatList
				data={filteredPokemons}
				key={rows}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => <PokeCard pokemon={item} Rows={rows} />}
				onEndReached={fetchMorePokemons}
				numColumns={rows}
				onEndReachedThreshold={0.4}
				scrollIndicatorInsets={{ right: 1 }}
				ListFooterComponent={
					loadingMore ? (
						<ActivityIndicator
							size="large"
							color="#EF5350"
							style={{ marginVertical: 20 }}
						/>
					) : null
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons name="search" size={48} color={colors.border} />
						<Text style={[styles.emptyText, { color: colors.mutedText }]}>
							No Pokémon found
						</Text>
					</View>
				}
			/>
		</View>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	countContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
	},
	countText: {
		fontSize: 12,
		fontWeight: "500",
		letterSpacing: 0.5,
	},
	listContent: {
		paddingHorizontal: 8,
		paddingVertical: 8,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 16,
		marginTop: 16,
		fontWeight: "500",
	},
});
