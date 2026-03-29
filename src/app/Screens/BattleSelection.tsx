import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { SafeAreaView } from "react-native-safe-area-context";
import PokeCard from "../../components/pokeCard";
import { useTheme } from "@/src/context/ThemeContext";
import { getFavoritePokemonsFromCache } from "@/src/functions/PokemonCacheDb";
import type { PokemonAPI } from "@/src/interface/PokeAPInterface";

const BattleSelection = () => {
	const router = useRouter();
	const { colors } = useTheme();
	const [favorites, setFavorites] = React.useState<PokemonAPI[]>([]);
	const [loading, setLoading] = React.useState(true);

	const loadFavorites = React.useCallback(async () => {
		try {
			setLoading(true);
			const cachedFavorites = await getFavoritePokemonsFromCache();
			setFavorites(cachedFavorites.map((cp) => cp.pokemon));
		} catch (error) {
			console.error("Failed to load favorites", error);
			setFavorites([]);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		loadFavorites();
	}, [loadFavorites]);

	const handleSelectPokemon = (pokemon: PokemonAPI) => {
		router.push({
			pathname: "../Screens/BattleArena",
			params: { pokemonId: pokemon.id.toString() },
		});
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View
				style={[
					styles.header,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<View style={styles.headerContent}>
					<View style={styles.headerTitleSection}>
						<Ionicons name="flame" size={20} color={colors.accent} />
						<Text style={[styles.headerTitle, { color: colors.text }]}>
							Battle Arena
						</Text>
					</View>
					<Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
						Pick your champion
					</Text>
				</View>

				{/* Right Side Options */}
				<View style={styles.headerRight}>
					<TouchableOpacity
						onPress={() => {
							router.push("../Screens/BattleHistory");
						}}
						style={[styles.historyButton, { backgroundColor: colors.accent }]}>
						<Ionicons name="time-outline" size={16} color="white" />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => {
							void loadFavorites();
						}}
						style={[
							styles.RefreshButton,
							{ backgroundColor: colors.accent, marginLeft: 8 },
						]}>
						<Ionicons name="refresh-sharp" size={16} color="white" />
					</TouchableOpacity>
				</View>
			</View>

			{loading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={colors.accent} />
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
						Add Pokemon to favorites to battle
					</Text>
					<TouchableOpacity
						style={[styles.navButton, { backgroundColor: colors.accent }]}
						onPress={() => router.push("/(tabs)/favorites")}>
						<Ionicons name="refresh-sharp" size={16} color="white" />
						<Text style={styles.navButtonText}>Go to Favorites</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View style={{ flex: 1 }}>
					<LegendList
						data={favorites}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.listContent}
						renderItem={({ item }) => (
							<PokeCard
								pokemon={item}
								Rows={2}
								onPress={() => handleSelectPokemon(item)}
								disableNavigation
								showFavoriteButton={false}
							/>
						)}
						numColumns={2}
						scrollIndicatorInsets={{ right: 1 }}
						estimatedItemSize={200}
						recycleItems
						showsVerticalScrollIndicator={false}
					/>
				</View>
			)}
		</SafeAreaView>
	);
};

export default BattleSelection;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: "-6%",
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerContent: {
		gap: 4,
	},
	headerTitleSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
	},
	headerSubtitle: {
		fontSize: 12,
		fontWeight: "400",
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
		textAlign: "center",
		paddingHorizontal: 20,
	},
	navButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		marginTop: 24,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
	},
	navButtonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	historyButton: {
		padding: 15,
		borderRadius: 20,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},
	RefreshButton: {
		padding: 15,
		borderRadius: 20,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
	},

	listContent: {
		paddingHorizontal: 8,
		paddingVertical: 8,
	},
});
