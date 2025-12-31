import PokeCard from "../components/pokeCard";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const Home = ({
	pokemons,
	fetchMorePokemons,
	rows,
	loadingMore,
	setRows,
}: any) => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredPokemons = pokemons.filter((pokemon : any) =>
		pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<View style={styles.container}>
			{/* Header Section */}
			<View style={styles.headerContainer}>
				<View style={styles.titleSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
					<Text style={styles.titleText}>Pokédex</Text>
          <MaterialDesignIcons name="pokeball" color="#ff0000" size={40} style={{marginTop: 5}}/>
          </View>
					<Text style={styles.subtitleText}>Catch 'em all!</Text>
				</View>
			</View>

			{/* Search & Filter Bar */}
			<View style={styles.toolbarContainer}>
				{/* Search Bar */}
				<View style={styles.searchBarWrapper}>
					<Ionicons name="search" size={20} color="#EF5350" />
					<TextInput
						placeholder="Search Pokémon"
						placeholderTextColor="#999"
						value={searchQuery}
						onChangeText={setSearchQuery}
						style={styles.searchInput}
					/>
					{searchQuery !== "" && (
						<Pressable onPress={() => setSearchQuery("")}>
							<Ionicons name="close-circle" size={20} color="#EF5350" />
						</Pressable>
					)}
				</View>

				{/* Grid Toggle Button */}
				<Pressable
					style={({ pressed }) => [
						styles.toggleButton,
						pressed && styles.toggleButtonPressed,
					]}
					onPress={() => setRows(rows === 1 ? 2 : 1)}>
					<Ionicons
						name={rows === 1 ? "list" : "grid"}
						size={30}
						color="#fff"
					/>
				</Pressable>
			</View>

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
				renderItem={({ item }) => PokeCard(item, rows)}
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
	headerContainer: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	titleSection: {
		marginBottom: 1,
	},
	titleText: {
		fontSize: 32,
		fontWeight: "700",
		color: "#EF5350",
		letterSpacing: 1,
	},
	subtitleText: {
		fontSize: 14,
		color: "#888",
		marginTop: 4,
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
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	searchInput: {
		flex: 1,
		marginHorizontal: 8,
		fontSize: 16,
		color: "#333",
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
	toggleButtonPressed: {
		backgroundColor: "#E53935",
		elevation: 1,
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
