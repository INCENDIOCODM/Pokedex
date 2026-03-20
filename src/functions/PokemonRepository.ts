import { PokemonAPI } from "@/src/interface/PokeAPInterface";

import { featchPokemonData, featchPokemonsList } from "./ApiCalls";
import {
	getCachedListPage,
	getCachedPokemonById,
	getCachedPokemonsByIds,
	initPokemonCacheDb,
	makeListPageKey,
	upsertListPage,
	upsertPokemon,
	upsertPokemons,
} from "./PokemonCacheDb";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type PageLoadResult = {
	pokemons: PokemonAPI[];
	hasMore: boolean;
	source: "cache" | "network";
	stale: boolean;
};

export type DetailLoadResult = {
	pokemon: PokemonAPI | null;
	source: "cache" | "network" | "none";
	stale: boolean;
};

const isFresh = (updatedAt: number, ttlMs: number): boolean =>
	Date.now() - updatedAt <= ttlMs;

const fetchAndCachePage = async (
	offset: number,
	limit: number,
): Promise<PageLoadResult> => {
	const pageUrl = `${BASE_URL}?offset=${offset}&limit=${limit}`;
	const listResponse = await featchPokemonsList(pageUrl);
	const pokemons = await Promise.all(
		listResponse.results.map((item) => featchPokemonData(item.url)),
	);

	const now = Date.now();
	const pageKey = makeListPageKey(offset, limit);
	const ids = pokemons.map((pokemon) => pokemon.id);

	await upsertPokemons(pokemons, now);
	await upsertListPage(pageKey, ids, listResponse.next, now);

	return {
		pokemons,
		hasMore: Boolean(listResponse.next),
		source: "network",
		stale: false,
	};
};

const fetchAndCacheDetail = async (id: number): Promise<PokemonAPI> => {
	const pokemon = await featchPokemonData(`${BASE_URL}/${id}`);
	await upsertPokemon(pokemon, Date.now());
	return pokemon;
};

export const loadPokemonPage = async (
	offset: number,
	limit: number,
): Promise<PageLoadResult> => {
	await initPokemonCacheDb();

	const pageKey = makeListPageKey(offset, limit);
	const cachedPage = await getCachedListPage(pageKey);

	if (cachedPage) {
		const cachedEntries = await getCachedPokemonsByIds(cachedPage.ids);
		const hasCompletePage = cachedEntries.length === cachedPage.ids.length;

		if (hasCompletePage) {
			const cachedPokemons = cachedEntries.map((entry) => entry.pokemon);
			const stalePage = !isFresh(cachedPage.updatedAt, LIST_CACHE_TTL_MS);
			const staleDetails = cachedEntries.some(
				(entry) => !isFresh(entry.updatedAt, DETAIL_CACHE_TTL_MS),
			);
			const stale = stalePage || staleDetails;

			if (!stale) {
				return {
					pokemons: cachedPokemons,
					hasMore: Boolean(cachedPage.nextUrl),
					source: "cache",
					stale: false,
				};
			}

			try {
				return await fetchAndCachePage(offset, limit);
			} catch {
				return {
					pokemons: cachedPokemons,
					hasMore: Boolean(cachedPage.nextUrl),
					source: "cache",
					stale: true,
				};
			}
		}
	}

	return fetchAndCachePage(offset, limit);
};

export const loadPokemonDetail = async (
	id: number,
): Promise<DetailLoadResult> => {
	await initPokemonCacheDb();

	const cached = await getCachedPokemonById(id);
	if (cached) {
		if (isFresh(cached.updatedAt, DETAIL_CACHE_TTL_MS)) {
			return {
				pokemon: cached.pokemon,
				source: "cache",
				stale: false,
			};
		}

		try {
			const freshPokemon = await fetchAndCacheDetail(id);
			return {
				pokemon: freshPokemon,
				source: "network",
				stale: false,
			};
		} catch {
			return {
				pokemon: cached.pokemon,
				source: "cache",
				stale: true,
			};
		}
	}

	try {
		const pokemon = await fetchAndCacheDetail(id);
		return {
			pokemon,
			source: "network",
			stale: false,
		};
	} catch {
		return {
			pokemon: null,
			source: "none",
			stale: true,
		};
	}
};
