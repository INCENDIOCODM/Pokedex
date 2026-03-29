import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LegendList } from "@legendapp/list";
import PokeCard from "../../components/pokeCard";
import { GetAllFavourites } from "../../functions/FavouritePokemons";
import { getCachedPokemonsByIds } from "../../functions/PokemonCacheDb";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const Favorites = () => {
	const { colors } = useTheme();
	const [favorites, setFavorites] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(true);

	const loadFavorites = React.useCallback(async () => {
		try {
			setLoading(true);
			const favoriteIds = await GetAllFavourites();
			if (favoriteIds.length > 0) {
				const cachedPokemons = await getCachedPokemonsByIds(favoriteIds);
				const pokemonList = cachedPokemons.map((cp) => cp.pokemon);
				setFavorites(pokemonList);
			} else {
				setFavorites([]);
			}
		} catch (error) {
			console.error("Failed to load favorites", error);
			setFavorites([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadFavorites();
		}, [loadFavorites]),
	);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Count Badge */}
			<View
				style={[
					styles.countContainer,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<Text style={[styles.countText, { color: colors.mutedText }]}>
					{favorites.length} Favorite{favorites.length !== 1 ? "s" : ""}
				</Text>
			</View>

			{loading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#EF5350" />
				</View>
			) : favorites.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Ionicons name="heart-outline" size={48} color={colors.border} />
					<Text style={[styles.emptyText, { color: colors.mutedText }]}>
						No favorites yet
					</Text>
					<Text
						style={[
							styles.emptySubText,
							{ color: colors.mutedText, marginTop: 8 },
						]}>
						Add pokemon to favorites to see them here
					</Text>
				</View>
			) : (
				<LegendList
					data={favorites}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => <PokeCard pokemon={item} Rows={2} />}
					numColumns={2}
					scrollIndicatorInsets={{ right: 1 }}
					estimatedItemSize={200}
					recycleItems
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
};

export default Favorites;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: "-5%",
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
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
	emptySubText: {
		fontSize: 14,
		fontWeight: "400",
	},
});
