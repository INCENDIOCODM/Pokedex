// Index.tsx
import Home from "@/src/app/Screens/Home";
import {
	featchPokemonData,
	featchPokemonsList,
} from "@/src/functions/ApiCalls";
import { PokemonAPI } from "@/src/interface/PokeAPInterface";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
	const count = 30;
	const baseUrl = "https://pokeapi.co/api/v2/pokemon";
	const [pokemons, setPokemons] = useState<PokemonAPI[]>([]);
	const [initialLoading, setInitialLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [rows, setRows] = useState(1);
	const StorageKey = ["PokemonList", "PokemonData"];

	// Initial load
	useEffect(() => {
		const loadPokemons = async () => {
			try {
				const list = await featchPokemonsList(`${baseUrl}?limit=${count}`);
				const detailPromises = list.results.map((item) =>
					featchPokemonData(item.url)
				);
				const details = await Promise.all(detailPromises);
				setPokemons(details);
				if (!list.next) setHasMore(false);
			} catch (err) {
				console.error("Failed to load pokemons", err);
			} finally {
				setInitialLoading(false);
			}
		};
		loadPokemons();
	}, []);

	// Load more when reaching end
	const fetchMorePokemons = async () => {
		if (loadingMore || !hasMore) return;

		setLoadingMore(true);
		try {
			const newUrl = `${baseUrl}?offset=${pokemons.length}&limit=${count}`;
			const response = await featchPokemonsList(newUrl);
			const detailPromises = response.results.map((item) =>
				featchPokemonData(item.url)
			);
			const morePokemons = await Promise.all(detailPromises);
			setPokemons((prev) => [...prev, ...morePokemons]);
			if (!response.next) setHasMore(false);
		} catch (error) {
			console.error("Failed to fetch more pokemons", error);
		} finally {
			setLoadingMore(false);
		}
	};

	if (initialLoading) {
		return (
			<SafeAreaView
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Home
				pokemons={pokemons}
				fetchMorePokemons={fetchMorePokemons}
				rows={rows}
				loadingMore={loadingMore}
				setRows={setRows}
			/>
		</SafeAreaView>
	);
}
