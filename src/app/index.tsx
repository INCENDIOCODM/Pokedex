// Index.tsx
import Home from "@/src/app/Screens/Home";
import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SkeletonScreen from "./Screens/SkeletonScreen";
import { loadPokemonPage } from "@/src/functions/PokemonRepository";

const mergeById = (
	current: PokemonAPI[],
	incoming: PokemonAPI[],
): PokemonAPI[] => {
	const byId = new Map<number, PokemonAPI>();
	for (const pokemon of current) {
		byId.set(pokemon.id, pokemon);
	}
	for (const pokemon of incoming) {
		byId.set(pokemon.id, pokemon);
	}

	return Array.from(byId.values()).sort((a, b) => a.id - b.id);
};

export default function App() {
	const count = 30;
	const [pokemons, setPokemons] = useState<PokemonAPI[]>([]);
	const [loadingInitial, setLoadingInitial] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [rows, setRows] = useState(1);

	// Initial load
	useEffect(() => {
		let isMounted = true;

		const loadPokemons = async () => {
			setLoadingInitial(true);
			try {
				const result = await loadPokemonPage(0, count);
				if (!isMounted) return;

				setPokemons(result.pokemons);
				setHasMore(result.hasMore);
			} catch (err) {
				console.error("Failed to load pokemons", err);
			} finally {
				if (isMounted) {
					setLoadingInitial(false);
				}
			}
		};

		loadPokemons();

		return () => {
			isMounted = false;
		};
	}, []);

	// Load more when reaching end
	const fetchMorePokemons = async () => {
		if (loadingMore || !hasMore) return;

		setLoadingMore(true);
		try {
			const result = await loadPokemonPage(pokemons.length, count);
			setPokemons((prev) => mergeById(prev, result.pokemons));
			setHasMore(result.hasMore);
		} catch (error) {
			console.error("Failed to fetch more pokemons", error);
		} finally {
			setLoadingMore(false);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			{loadingInitial ? (
				<SkeletonScreen variant="home" rows={rows === 1 ? 1 : 2} count={8} />
			) : (
				<Home
					pokemons={pokemons}
					fetchMorePokemons={fetchMorePokemons}
					rows={rows}
					loadingMore={loadingMore}
					setRows={setRows}
				/>
			)}
		</SafeAreaView>
	);
}
