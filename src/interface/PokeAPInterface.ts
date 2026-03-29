// PokeAPInterface.tsx
interface PokemonAPI {
	id: number;
	name: string;
	weight: number;
	height: number;
	base_experience: number;
	order: number;
	is_default?: boolean;
	species?: {
		name: string;
		url: string;
	};
	forms?: { name: string; url: string }[];
	cries?: {
		latest?: string | null;
		legacy?: string | null;
	};

	sprites: {
		front_default: string | null;
		back_default: string | null;
		other?: {
			"official-artwork"?: {
				front_default: string | null;
			};
			dream_world?: {
				front_default?: string | null;
			};
		};
	};

	abilities: {
		ability: { name: string };
		is_hidden?: boolean;
		slot?: number;
	}[];
	types: { type: { name: string } }[];
	stats: { base_stat: number; stat: { name: string } }[];
	moves: { move: { name: string; url: string } }[];
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
