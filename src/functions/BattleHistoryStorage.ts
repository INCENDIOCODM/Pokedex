import * as SQLite from "expo-sqlite";
import { getData, storeData } from "@/src/functions/Storage";
import type {
	BattleHistoryItem,
	BattleResult,
} from "@/src/interface/BattleInterface";

const DB_NAME = "battle.db";
const LEGACY_BATTLE_HISTORY_KEY = "battle_history";
const MAX_BATTLE_HISTORY = 200;

const db = SQLite.openDatabaseSync(DB_NAME);
let initialized = false;
let migrationStarted = false;

type MetaRow = {
	value: string;
};

type BattleHistoryRow = {
	id: number;
	timestamp: number;
	winner: "player" | "opponent";
	loser: "player" | "opponent";
	rounds_played: number;
	player_damage_dealt: number;
	opponent_damage_dealt: number;
	player_pokemon_id: number;
	player_pokemon_name: string;
	opponent_pokemon_id: number;
	opponent_pokemon_name: string;
};

type CountRow = {
	count: number;
};

const getMetaValue = (key: string): string | null => {
	const row = db.getFirstSync(
		"SELECT value FROM battle_meta WHERE key = ?",
		key,
	) as MetaRow | null;
	return row?.value ?? null;
};

const setMetaValue = (key: string, value: string): void => {
	db.runSync(
		`INSERT INTO battle_meta (key, value) VALUES (?, ?)
		 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
		key,
		value,
	);
};

const toBattleHistoryFields = (result: BattleResult) => ({
	timestamp: result.timestamp,
	winner: result.winner,
	loser: result.loser,
	roundsPlayed: result.roundsPlayed,
	playerDamageDealt: result.playerDamageDealt,
	opponentDamageDealt: result.opponentDamageDealt,
	playerPokemonId: result.playerPokemon.id,
	playerPokemonName: result.playerPokemon.name,
	opponentPokemonId: result.opponentPokemon.id,
	opponentPokemonName: result.opponentPokemon.name,
});

const insertBattleHistoryRow = (
	fields: Omit<BattleHistoryItem, "id">,
): void => {
	db.runSync(
		`INSERT OR IGNORE INTO battle_history (
			timestamp,
			winner,
			loser,
			rounds_played,
			player_damage_dealt,
			opponent_damage_dealt,
			player_pokemon_id,
			player_pokemon_name,
			opponent_pokemon_id,
			opponent_pokemon_name
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		fields.timestamp,
		fields.winner,
		fields.loser,
		fields.roundsPlayed,
		fields.playerDamageDealt,
		fields.opponentDamageDealt,
		fields.playerPokemonId,
		fields.playerPokemonName,
		fields.opponentPokemonId,
		fields.opponentPokemonName,
	);
};

const pruneOldRows = (): void => {
	const row = db.getFirstSync(
		"SELECT COUNT(*) AS count FROM battle_history",
	) as CountRow | null;

	if (!row || row.count <= MAX_BATTLE_HISTORY) {
		return;
	}

	db.runSync(
		`DELETE FROM battle_history
		 WHERE id NOT IN (
			SELECT id FROM battle_history
			ORDER BY timestamp DESC
			LIMIT ?
		 )`,
		MAX_BATTLE_HISTORY,
	);
};

const migrateLegacyAsyncStorageIfNeeded = async (): Promise<void> => {
	const migrated = getMetaValue("legacy_history_migrated");
	if (migrated === "1") {
		return;
	}

	try {
		const raw = await getData(LEGACY_BATTLE_HISTORY_KEY);
		if (raw) {
			const legacy = JSON.parse(raw) as BattleResult[];
			if (Array.isArray(legacy)) {
				for (const result of legacy) {
					if (
						result &&
						typeof result.timestamp === "number" &&
						result.playerPokemon &&
						result.opponentPokemon
					) {
						insertBattleHistoryRow(toBattleHistoryFields(result));
					}
				}
				pruneOldRows();
			}
		}
		await storeData(LEGACY_BATTLE_HISTORY_KEY, JSON.stringify([]));
	} catch (error) {
		console.error("Failed to migrate legacy battle history", error);
	} finally {
		setMetaValue("legacy_history_migrated", "1");
	}
};

const initBattleHistoryDb = async (): Promise<void> => {
	if (initialized) {
		return;
	}

	db.execSync(`
		PRAGMA journal_mode = WAL;
		PRAGMA synchronous = NORMAL;

		CREATE TABLE IF NOT EXISTS battle_meta (
			key TEXT PRIMARY KEY NOT NULL,
			value TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS battle_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			timestamp INTEGER NOT NULL UNIQUE,
			winner TEXT NOT NULL,
			loser TEXT NOT NULL,
			rounds_played INTEGER NOT NULL,
			player_damage_dealt INTEGER NOT NULL,
			opponent_damage_dealt INTEGER NOT NULL,
			player_pokemon_id INTEGER NOT NULL,
			player_pokemon_name TEXT NOT NULL,
			opponent_pokemon_id INTEGER NOT NULL,
			opponent_pokemon_name TEXT NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_battle_history_timestamp
		ON battle_history (timestamp DESC);
	`);

	initialized = true;

	if (!migrationStarted) {
		migrationStarted = true;
		void migrateLegacyAsyncStorageIfNeeded();
	}
};

export const getBattleHistory = async (
	limit = 100,
): Promise<BattleHistoryItem[]> => {
	try {
		await initBattleHistoryDb();
		const rows = db.getAllSync(
			`SELECT
				id,
				timestamp,
				winner,
				loser,
				rounds_played,
				player_damage_dealt,
				opponent_damage_dealt,
				player_pokemon_id,
				player_pokemon_name,
				opponent_pokemon_id,
				opponent_pokemon_name
			 FROM battle_history
			 ORDER BY timestamp DESC
			 LIMIT ?`,
			limit,
		) as BattleHistoryRow[];

		return rows.map((row) => ({
			id: row.id,
			timestamp: row.timestamp,
			winner: row.winner,
			loser: row.loser,
			roundsPlayed: row.rounds_played,
			playerDamageDealt: row.player_damage_dealt,
			opponentDamageDealt: row.opponent_damage_dealt,
			playerPokemonId: row.player_pokemon_id,
			playerPokemonName: row.player_pokemon_name,
			opponentPokemonId: row.opponent_pokemon_id,
			opponentPokemonName: row.opponent_pokemon_name,
		}));
	} catch (error) {
		console.error("Failed to read battle history", error);
		return [];
	}
};

export const saveBattleResultToHistory = async (
	result: BattleResult,
): Promise<void> => {
	try {
		await initBattleHistoryDb();
		insertBattleHistoryRow(toBattleHistoryFields(result));
		pruneOldRows();
	} catch (error) {
		console.error("Failed to save battle history", error);
	}
};

export const clearBattleHistory = async (): Promise<void> => {
	try {
		await initBattleHistoryDb();
		db.runSync("DELETE FROM battle_history");
	} catch (error) {
		console.error("Failed to clear battle history", error);
	}
};
