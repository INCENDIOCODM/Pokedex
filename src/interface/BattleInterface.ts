import type { PokemonAPI } from "./PokeAPInterface";

export interface BattlePokemonSnapshot {
	id: number;
	name: string;
	imageUrl: string | null;
}

export interface BattleMove {
	name: string;
	power: number;
	accuracy: number;
	type: string;
	category: "physical" | "special" | "status";
}

export interface BattleParticipant {
	pokemon: PokemonAPI;
	currentHp: number;
	maxHp: number;
	moves: BattleMove[];
	level: number;
}

export interface BattleAction {
	actor: "player" | "opponent";
	moveName: string;
	damage: number;
	typeEffectiveness: number;
	message: string;
	timestamp: number;
}

export interface BattleState {
	player: BattleParticipant;
	opponent: BattleParticipant;
	round: number;
	playerHp: number;
	opponentHp: number;
	isPlayerTurn: boolean;
	gameOver: boolean;
	winner: "player" | "opponent" | null;
	battleLog: BattleAction[];
	playerSpeed: number;
	opponentSpeed: number;
}

export interface BattleResult {
	winner: "player" | "opponent";
	loser: "player" | "opponent";
	roundsPlayed: number;
	playerDamageDealt: number;
	opponentDamageDealt: number;
	battleLog: BattleAction[];
	playerPokemon: BattlePokemonSnapshot;
	opponentPokemon: BattlePokemonSnapshot;
	timestamp: number;
}

export interface BattleHistoryItem {
	id: number;
	timestamp: number;
	winner: "player" | "opponent";
	loser: "player" | "opponent";
	roundsPlayed: number;
	playerDamageDealt: number;
	opponentDamageDealt: number;
	playerPokemonId: number;
	playerPokemonName: string;
	opponentPokemonId: number;
	opponentPokemonName: string;
}
