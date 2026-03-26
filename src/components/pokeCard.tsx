import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import typeColors from "./Pokemontype/poketype";
import { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
	CheckIfFavourite,
	ToggleFavourite,
} from "../functions/FavouritePokemons";

type PokemonTypeKey = keyof typeof typeColors;

type PokeCardProps = {
	pokemon: PokemonAPI;
	Rows: number;
	onFavoriteChange?: () => void;
};

const PokeCard = ({ pokemon, Rows, onFavoriteChange }: PokeCardProps) => {
	const router = useRouter();
	const { name, sprites, types } = pokemon;
	const [isFavorite, setIsFavorite] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		checkFavoriteStatus();
	}, [pokemon.id]);

	const checkFavoriteStatus = async () => {
		const status = await CheckIfFavourite(pokemon.id);
		setIsFavorite(status);
	};

	const handleToggleFavorite = async (e: any) => {
		e.stopPropagation();
		setLoading(true);
		try {
			const result = await ToggleFavourite(pokemon.id);
			setIsFavorite(result);
			onFavoriteChange?.();
		} catch (error) {
			console.error("Failed to toggle favorite", error);
		} finally {
			setLoading(false);
		}
	};

	const bg =
		types && types.length
			? typeColors[types[0].type.name as PokemonTypeKey]
			: "#eee";

	// Use flex-basis for grid columns so two cards fit side-by-side cleanly
	const outerStyle: any = {
		flexBasis: Rows === 2 ? "49%" : "95%",
		margin: 1,
	};

	return (
		<Pressable
			onPress={() => {
				// requestAnimationFrame to allow UI to respond before navigation
				requestAnimationFrame(() => {
					try {
						router.push({
							pathname: "/Screens/PokemonDetail",
							params: { pokemonId: String(pokemon.id) },
						});
					} catch (e) {
						console.warn("Navigation error", e);
					}
				});
			}}
			style={outerStyle}>
			<View
				style={[
					styles.card,
					{
						backgroundColor: bg,
					},
				]}>
				{/* Like Button */}
				<Pressable
					onPress={handleToggleFavorite}
					disabled={loading}
					style={styles.likeButton}>
					<Ionicons
						name={isFavorite ? "heart" : "heart-outline"}
						size={20}
						color={isFavorite ? "#ff4757" : "#fff"}
					/>
				</Pressable>

				{sprites.front_default && (
					<Image
						source={{ uri: sprites.front_default }}
						style={styles.image}
						contentFit="contain"
						cachePolicy="disk"
						transition={120}
					/>
				)}
				<Text style={styles.name}>{name}</Text>
			</View>
		</Pressable>
	);
};

export default PokeCard;

const styles = StyleSheet.create({
	card: {
		padding: 20,
		alignItems: "center",
		margin: 10,
		borderRadius: 25,
		position: "relative",
	},
	likeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		padding: 8,
		zIndex: 10,
	},
	image: {
		width: 150,
		height: 150,
	},
	name: {
		marginTop: 2,
		fontSize: 20,
		textTransform: "capitalize",
		textAlign: "center",
	},
});
