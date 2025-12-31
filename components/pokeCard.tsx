import { PokemonAPI } from "@/interface/PokeAPInterface";
import { Image, StyleSheet, Text, View } from "react-native";
import typeColors from "./Pokemontype/poketype";

type PokemonTypeKey = keyof typeof typeColors;

const PokeCard = ({ name, sprites, types, id }: PokemonAPI, Rows: number) => {
	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: typeColors[types[0].type.name as PokemonTypeKey],
					width: Rows === 2 ? "45%" : "95%",
				},
			]}>
			<View
				style={{
					flexDirection: "row",
					borderRadius: 10,
				}}>
				{sprites.front_default && (
					<Image source={{ uri: sprites.front_default }} style={styles.image} />
				)}
				{/* {sprites.back_default && ( <Image source={{ uri: sprites.back_default }} style={styles.image} /> )} */}
			</View>
			<Text style={styles.name}>{name}</Text>
			{/* <Text style={styles.name}>#{id}</Text> */}
		</View>
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
		marginTop: 5,
		fontSize: 25,
		textTransform: "capitalize",
		textAlign: "center",
	},
});
