import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
} from "react-native";
import { LegendList } from "@legendapp/list";
import PokeCard from "../../components/pokeCard";

import SearchBar from "../../components/SearchBar";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import { featchPokemonData } from "@/src/functions/ApiCalls";
import {
	upsertPokemon,
	initPokemonCacheDb,
	getCachedPokemonById,
	searchCachedPokemonByName,
} from "@/src/functions/PokemonCacheDb";

const Home = ({
	pokemons,
	fetchMorePokemons,
	rows,
	loadingMore,
	setRows,
}: any) => {
	const router = useRouter();
	const { colors } = useTheme();
	const [searchQuery, setSearchQuery] = useState("");
	const [forceSearchLoading, setForceSearchLoading] = useState(false);
	const [cachedSearchResults, setCachedSearchResults] = useState<PokemonAPI[]>(
		[],
	);

	const normalizedRows: 1 | 2 = Number(rows) === 1 ? 1 : 2;

	// Search cache when search query changes
	React.useEffect(() => {
		if (!searchQuery.trim()) {
			setCachedSearchResults([]);
			return;
		}

		const searchCache = async () => {
			try {
				const results = await searchCachedPokemonByName(searchQuery.trim());
				setCachedSearchResults(results.map((r: any) => r.pokemon));
			} catch (error) {
				console.error("Error searching cache:", error);
				setCachedSearchResults([]);
			}
		};

		searchCache();
	}, [searchQuery]);

	const handleForceSearch = async () => {
		if (!searchQuery.trim()) {
			alert("Please enter a Pokémon name or ID to search");
			return;
		}

		setForceSearchLoading(true);
		try {
			await initPokemonCacheDb();
			const pokemonName = searchQuery.trim().toLowerCase();
			console.log("Fetching Pokémon:", pokemonName);

			const pokemon = await featchPokemonData(
				`https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
			);

			console.log("Fetched Pokémon:", pokemon.id, pokemon.name);
			console.log("Caching Pokémon with ID:", pokemon.id);

			await upsertPokemon(pokemon, Date.now());

			console.log("Pokémon cache operation completed");

			// Verify the cache write was successful
			const cachedPokemon = await getCachedPokemonById(pokemon.id);
			console.log("Verification - Cached Pokémon found:", !!cachedPokemon);

			if (!cachedPokemon) {
				console.warn(
					"Pokémon was not cached successfully, but will attempt to navigate anyway",
				);
			}

			// Small delay to ensure database write is committed
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Navigate to the Pokemon detail page
			console.log("Navigating to detail page for ID:", pokemon.id);
			router.push({
				pathname: "../Screens/PokemonDetail",
				params: { pokemonId: pokemon.id.toString() },
			});
		} catch (error) {
			console.error("Force search error:", error);
			alert(
				`Pokémon "${searchQuery}" not found. Please check the name and try again.`,
			);
		} finally {
			setForceSearchLoading(false);
		}
	};

	// Combine loaded pokemons with cache search results
	const filteredPokemons = React.useMemo(() => {
		// Filter loaded pokemons
		const loadedMatches = pokemons.filter((pokemon: any) =>
			pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()),
		);

		// Create a set of IDs from loaded matches for deduplication
		const loadedIds = new Set(loadedMatches.map((p: any) => p.id));

		// Add cache results that aren't already in loaded matches
		const combinedResults = [
			...loadedMatches,
			...cachedSearchResults.filter((p) => !loadedIds.has(p.id)),
		];

		return combinedResults;
	}, [pokemons, searchQuery, cachedSearchResults]);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<SearchBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				rows={normalizedRows}
				setRows={setRows}
				onPressSettings={() => router.push("../Screens/Settings")}
			/>

			<LegendList
				data={filteredPokemons as PokemonAPI[]}
				key={rows}
				keyExtractor={(item: PokemonAPI) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }: { item: PokemonAPI }) => (
					<PokeCard pokemon={item} Rows={rows} />
				)}
				onEndReached={fetchMorePokemons}
				numColumns={rows}
				onEndReachedThreshold={0.4}
				scrollIndicatorInsets={{ right: 1 }}
				estimatedItemSize={200}
				recycleItems
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				ListFooterComponent={
					loadingMore ? (
						<ActivityIndicator
							size="large"
							color={colors.accent}
							style={{ marginVertical: 20 }}
						/>
					) : null
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<View
							style={[
								styles.emptyIconWrap,
								{ backgroundColor: colors.surface, borderColor: colors.border },
							]}>
							<Ionicons name="search" size={36} color={colors.border} />
						</View>
						<Text style={[styles.emptyText, { color: colors.mutedText }]}>
							No Pokémon found
						</Text>
						<Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
							Try a different name or clear your search.
						</Text>

						{searchQuery.trim() && (
							<TouchableOpacity
								onPress={handleForceSearch}
								disabled={forceSearchLoading}
								style={[
									styles.forceSearchButton,
									{
										backgroundColor: colors.accent,
										opacity: forceSearchLoading ? 0.6 : 1,
									},
								]}>
								{forceSearchLoading ? (
									<ActivityIndicator size="small" color={colors.background} />
								) : (
									<>
										<Ionicons
											name="search"
											size={16}
											color={colors.background}
											style={{ marginRight: 8 }}
										/>
										<Text
											style={[
												styles.forceSearchButtonText,
												{ color: colors.background },
											]}>
											Force Search: "{searchQuery}"
										</Text>
									</>
								)}
							</TouchableOpacity>
						)}
					</View>
				}
			/>
		</View>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {},
	listContent: {
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 22,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 72,
	},
	emptyIconWrap: {
		width: 78,
		height: 78,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
	},
	emptyText: {
		fontSize: 16,
		marginTop: 14,
		fontWeight: "600",
	},
	emptySubtext: {
		fontSize: 13,
		marginTop: 8,
		textAlign: "center",
	},
	forceSearchButton: {
		marginTop: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 44,
	},
	forceSearchButtonText: {
		fontSize: 14,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
});
