// PokeAPInterface.tsx
interface PokemonAPI {
	id: number;
	name: string;
	weight: number;
	height: number;

	sprites: {
		front_default: string | null;
		back_default: string | null;
	};

	abilities: { ability: { name: string } }[];
	types: { type: { name: string } }[];
}

export interface PokemonListAPI {
	count: number;
	next: string | null;
	previous: string | null;
	results: { name: string; url: string }[];
}

export type pokemonListAPI = PokemonListAPI;

interface CacheData {
	pokemons: PokemonAPI[];
	timestamp: number;
	version: string;
}

export type { CacheData, PokemonAPI };
