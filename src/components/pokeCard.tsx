import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import typeColors from "./Pokemontype/poketype";

type PokemonTypeKey = keyof typeof typeColors;

type PokeCardProps = {
	pokemon: PokemonAPI;
	Rows: number;
};

const PokeCard = ({ pokemon, Rows }: PokeCardProps) => {
	const router = useRouter();
	const { name, sprites, types } = pokemon;

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
				{sprites.front_default && (
					<Image source={{ uri: sprites.front_default }} style={styles.image} />
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
