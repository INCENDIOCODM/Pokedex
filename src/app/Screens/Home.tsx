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

const Home = ({
	pokemons,
	fetchMorePokemons,
	rows,
	loadingMore,
	setRows,
}: any) => {
	const [searchQuery, setSearchQuery] = useState("");

	const normalizedRows: 1 | 2 = Number(rows) === 1 ? 1 : 2;
	const isInitialLoading = !Array.isArray(pokemons) || pokemons.length === 0;

	const filteredPokemons = pokemons.filter((pokemon: any) =>
		pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<View style={styles.container}>
			<SearchBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				rows={normalizedRows}
				setRows={setRows}
			/>

			{/* Pokemon Count Badge */}
			<View style={styles.countContainer}>
				<Text style={styles.countText}>{filteredPokemons.length} Pokémon</Text>
			</View>

			{/* FlatList */}
			<FlatList
				data={filteredPokemons}
				key={rows}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => <PokeCard pokemon={item} rows={rows} />}
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
						<Ionicons name="search" size={48} color="#ccc" />
						<Text style={styles.emptyText}>No Pokémon found</Text>
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
		backgroundColor: "#f5f5f5",
	},
	countContainer: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	countText: {
		fontSize: 12,
		color: "#666",
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
		color: "#999",
		marginTop: 16,
		fontWeight: "500",
	},
});
