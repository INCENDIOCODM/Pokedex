import * as SQLite from "expo-sqlite";

import { PokemonAPI } from "@/src/interface/PokeAPInterface";

const DB_NAME = "pokemon-cache.db";
const SCHEMA_VERSION = "1";

const db = SQLite.openDatabaseSync(DB_NAME);
let initialized = false;

type CacheMetaRow = {
	value: string;
};

type PokemonRow = {
	id: number;
	payload_json: string;
	updated_at: number;
};

type ListPageRow = {
	ids_json: string;
	next_url: string | null;
	updated_at: number;
};

type FavoriteRow = {
	id: number;
	added_at: number;
};

export type CachedPokemon = {
	pokemon: PokemonAPI;
	updatedAt: number;
};

export type CachedListPage = {
	ids: number[];
	nextUrl: string | null;
	updatedAt: number;
};

const safeJsonParse = <T>(value: string): T | null => {
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
};

const getMetaValue = (key: string): string | null => {
	const row = db.getFirstSync(
		"SELECT value FROM cache_meta WHERE key = ?",
		key,
	) as CacheMetaRow | null;
	return row?.value ?? null;
};

const setMetaValue = (key: string, value: string): void => {
	db.runSync(
		`INSERT INTO cache_meta (key, value) VALUES (?, ?)
		 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
		key,
		value,
	);
};

export const initPokemonCacheDb = async (): Promise<void> => {
	if (initialized) return;

	db.execSync(`
		CREATE TABLE IF NOT EXISTS cache_meta (
			key TEXT PRIMARY KEY NOT NULL,
			value TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS pokemon_cache (
			id INTEGER PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			payload_json TEXT NOT NULL,
			updated_at INTEGER NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_pokemon_cache_updated_at
		ON pokemon_cache (updated_at);

		CREATE TABLE IF NOT EXISTS list_page_cache (
			page_key TEXT PRIMARY KEY NOT NULL,
			ids_json TEXT NOT NULL,
			next_url TEXT,
			updated_at INTEGER NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_list_page_cache_updated_at
		ON list_page_cache (updated_at);

		CREATE TABLE IF NOT EXISTS favorites (
			id INTEGER PRIMARY KEY NOT NULL,
			added_at INTEGER NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_favorites_added_at
		ON favorites (added_at);
	`);

	const dbVersion = getMetaValue("schema_version");
	if (dbVersion !== SCHEMA_VERSION) {
		db.execSync("DELETE FROM pokemon_cache;");
		db.execSync("DELETE FROM list_page_cache;");
		setMetaValue("schema_version", SCHEMA_VERSION);
	}

	initialized = true;
};

export const makeListPageKey = (offset: number, limit: number): string =>
	`offset:${offset}-limit:${limit}`;

export const getCachedListPage = async (
	pageKey: string,
): Promise<CachedListPage | null> => {
	await initPokemonCacheDb();

	const row = db.getFirstSync(
		"SELECT ids_json, next_url, updated_at FROM list_page_cache WHERE page_key = ?",
		pageKey,
	) as ListPageRow | null;

	if (!row) return null;
	const ids = safeJsonParse<number[]>(row.ids_json);
	if (!ids || !Array.isArray(ids)) return null;

	return {
		ids,
		nextUrl: row.next_url,
		updatedAt: row.updated_at,
	};
};

export const upsertListPage = async (
	pageKey: string,
	ids: number[],
	nextUrl: string | null,
	updatedAt: number,
): Promise<void> => {
	await initPokemonCacheDb();
	db.runSync(
		`INSERT INTO list_page_cache (page_key, ids_json, next_url, updated_at)
		 VALUES (?, ?, ?, ?)
		 ON CONFLICT(page_key) DO UPDATE SET
			ids_json = excluded.ids_json,
			next_url = excluded.next_url,
			updated_at = excluded.updated_at`,
		pageKey,
		JSON.stringify(ids),
		nextUrl,
		updatedAt,
	);
};

export const getCachedPokemonById = async (
	id: number,
): Promise<CachedPokemon | null> => {
	await initPokemonCacheDb();

	const row = db.getFirstSync(
		"SELECT id, payload_json, updated_at FROM pokemon_cache WHERE id = ?",
		id,
	) as PokemonRow | null;

	if (!row) return null;
	const pokemon = safeJsonParse<PokemonAPI>(row.payload_json);
	if (!pokemon) return null;

	return {
		pokemon,
		updatedAt: row.updated_at,
	};
};

export const getCachedPokemonsByIds = async (
	ids: number[],
): Promise<CachedPokemon[]> => {
	await initPokemonCacheDb();
	if (ids.length === 0) return [];

	const placeholders = ids.map(() => "?").join(",");
	const rows = db.getAllSync(
		`SELECT id, payload_json, updated_at
		 FROM pokemon_cache
		 WHERE id IN (${placeholders})`,
		...ids,
	) as PokemonRow[];

	const byId = new Map<number, CachedPokemon>();
	for (const row of rows) {
		const pokemon = safeJsonParse<PokemonAPI>(row.payload_json);
		if (pokemon) {
			byId.set(row.id, {
				pokemon,
				updatedAt: row.updated_at,
			});
		}
	}

	return ids
		.map((id) => byId.get(id))
		.filter((entry): entry is CachedPokemon => Boolean(entry));
};

export const getRandomCachedPokemon = async (
	excludeId?: number,
): Promise<CachedPokemon | null> => {
	await initPokemonCacheDb();

	const row = excludeId
		? (db.getFirstSync(
				"SELECT id, payload_json, updated_at FROM pokemon_cache WHERE id != ? ORDER BY RANDOM() LIMIT 1",
				excludeId,
			) as PokemonRow | null)
		: (db.getFirstSync(
				"SELECT id, payload_json, updated_at FROM pokemon_cache ORDER BY RANDOM() LIMIT 1",
			) as PokemonRow | null);

	if (!row) return null;

	const pokemon = safeJsonParse<PokemonAPI>(row.payload_json);
	if (!pokemon) return null;

	return {
		pokemon,
		updatedAt: row.updated_at,
	};
};

export const upsertPokemon = async (
	pokemon: PokemonAPI,
	updatedAt: number,
): Promise<void> => {
	await initPokemonCacheDb();

	db.runSync(
		`INSERT INTO pokemon_cache (id, name, payload_json, updated_at)
		 VALUES (?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			payload_json = excluded.payload_json,
			updated_at = excluded.updated_at`,
		pokemon.id,
		pokemon.name,
		JSON.stringify(pokemon),
		updatedAt,
	);
};

export const upsertPokemons = async (
	pokemons: PokemonAPI[],
	updatedAt: number,
): Promise<void> => {
	for (const pokemon of pokemons) {
		await upsertPokemon(pokemon, updatedAt);
	}
};

export const clearCache = async (): Promise<void> => {
	await initPokemonCacheDb();
	db.execSync("DELETE FROM pokemon_cache;");
	db.execSync("DELETE FROM list_page_cache;");
};

export const addFavorite = async (pokemonId: number): Promise<void> => {
	await initPokemonCacheDb();
	db.runSync(
		`INSERT OR IGNORE INTO favorites (id, added_at)
		 VALUES (?, ?)`,
		pokemonId,
		Date.now(),
	);
};

export const removeFavorite = async (pokemonId: number): Promise<void> => {
	await initPokemonCacheDb();
	db.runSync("DELETE FROM favorites WHERE id = ?", pokemonId);
};

export const isFavorite = async (pokemonId: number): Promise<boolean> => {
	await initPokemonCacheDb();
	const row = db.getFirstSync(
		"SELECT id FROM favorites WHERE id = ?",
		pokemonId,
	) as FavoriteRow | null;
	return row !== null;
};

export const getFavoriteIds = async (): Promise<number[]> => {
	await initPokemonCacheDb();
	const rows = db.getAllSync(
		"SELECT id FROM favorites ORDER BY added_at DESC",
	) as FavoriteRow[];
	return rows.map((row) => row.id);
};

export const getFavoritePokemonsFromCache = async (): Promise<
	CachedPokemon[]
> => {
	await initPokemonCacheDb();

	const rows = db.getAllSync(
		`SELECT p.id, p.payload_json, p.updated_at
		 FROM favorites f
		 INNER JOIN pokemon_cache p ON p.id = f.id
		 ORDER BY f.added_at DESC`,
	) as PokemonRow[];

	const results: CachedPokemon[] = [];
	for (const row of rows) {
		const pokemon = safeJsonParse<PokemonAPI>(row.payload_json);
		if (pokemon) {
			results.push({
				pokemon,
				updatedAt: row.updated_at,
			});
		}
	}

	return results;
};

export const toggleFavorite = async (pokemonId: number): Promise<boolean> => {
	const isFav = await isFavorite(pokemonId);
	if (isFav) {
		await removeFavorite(pokemonId);
		return false;
	} else {
		await addFavorite(pokemonId);
		return true;
	}
};

export const searchCachedPokemonByName = async (
	searchTerm: string,
): Promise<CachedPokemon[]> => {
	await initPokemonCacheDb();

	const term = `%${searchTerm.toLowerCase()}%`;
	const rows = db.getAllSync(
		`SELECT id, payload_json, updated_at FROM pokemon_cache
		 WHERE LOWER(name) LIKE ?
		 ORDER BY name ASC`,
		term,
	) as PokemonRow[];

	const results: CachedPokemon[] = [];
	for (const row of rows) {
		const pokemon = safeJsonParse<PokemonAPI>(row.payload_json);
		if (pokemon) {
			results.push({
				pokemon,
				updatedAt: row.updated_at,
			});
		}
	}

	return results;
};
