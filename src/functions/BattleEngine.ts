import type { PokemonAPI } from "@/src/interface/PokeAPInterface";
import type {
	BattleMove,
	BattleParticipant,
	BattleState,
	BattleAction,
	BattleResult,
} from "@/src/interface/BattleInterface";
import {
	getTypeEffectiveness,
	getEffectivenessLabel,
} from "./TypeEffectiveness";

const FIXED_LEVEL = 50;
const BASE_HP_MULTIPLIER = 2;
const BASE_STAT_MULTIPLIER = 2;

/**
 * Extract moves from a Pokemon and convert to BattleMove format
 */
export const extractMovesFromPokemon = (pokemon: PokemonAPI): BattleMove[] => {
	const moves: BattleMove[] = (pokemon.moves || [])
		.slice(0, 8) // Limit to first 8 moves
		.map((moveData, index) => {
			const moveName = moveData.move.name;
			// Simplified move data - in a real app, you'd fetch detailed move info from PokéAPI
			// For now, use base assumptions
			const moveData_map: Record<string, BattleMove> = {
				"mega-punch": {
					name: "Mega Punch",
					power: 80,
					accuracy: 85,
					type: "normal",
					category: "physical",
				},
				"fire-punch": {
					name: "Fire Punch",
					power: 75,
					accuracy: 100,
					type: "fire",
					category: "physical",
				},
				"ice-punch": {
					name: "Ice Punch",
					power: 75,
					accuracy: 100,
					type: "ice",
					category: "physical",
				},
				thunderpunch: {
					name: "ThunderPunch",
					power: 75,
					accuracy: 100,
					type: "electric",
					category: "physical",
				},
				scratch: {
					name: "Scratch",
					power: 40,
					accuracy: 100,
					type: "normal",
					category: "physical",
				},
				"swords-dance": {
					name: "Swords Dance",
					power: 0,
					accuracy: 100,
					type: "normal",
					category: "status",
				},
				cut: {
					name: "Cut",
					power: 50,
					accuracy: 95,
					type: "normal",
					category: "physical",
				},
				bind: {
					name: "Bind",
					power: 15,
					accuracy: 85,
					type: "normal",
					category: "physical",
				},
				slam: {
					name: "Slam",
					power: 80,
					accuracy: 75,
					type: "normal",
					category: "physical",
				},
				"vine-whip": {
					name: "Vine Whip",
					power: 45,
					accuracy: 100,
					type: "grass",
					category: "physical",
				},
				"water-gun": {
					name: "Water Gun",
					power: 40,
					accuracy: 100,
					type: "water",
					category: "special",
				},
				ember: {
					name: "Ember",
					power: 40,
					accuracy: 100,
					type: "fire",
					category: "special",
				},
				thunderbolt: {
					name: "Thunderbolt",
					power: 90,
					accuracy: 100,
					type: "electric",
					category: "special",
				},
				"electric-shock": {
					name: "Electric Shock",
					power: 40,
					accuracy: 100,
					type: "electric",
					category: "special",
				},
				bite: {
					name: "Bite",
					power: 60,
					accuracy: 100,
					type: "normal",
					category: "physical",
				},
				growl: {
					name: "Growl",
					power: 0,
					accuracy: 100,
					type: "normal",
					category: "status",
				},
				roar: {
					name: "Roar",
					power: 0,
					accuracy: 100,
					type: "normal",
					category: "status",
				},
				sing: {
					name: "Sing",
					power: 0,
					accuracy: 55,
					type: "normal",
					category: "status",
				},
				splash: {
					name: "Splash",
					power: 0,
					accuracy: 100,
					type: "water",
					category: "status",
				},
				disable: {
					name: "Disable",
					power: 0,
					accuracy: 100,
					type: "normal",
					category: "status",
				},
				"poison-powder": {
					name: "Poison Powder",
					power: 0,
					accuracy: 75,
					type: "poison",
					category: "status",
				},
				"stun-spore": {
					name: "Stun Spore",
					power: 0,
					accuracy: 75,
					type: "grass",
					category: "status",
				},
				"sleep-powder": {
					name: "Sleep Powder",
					power: 0,
					accuracy: 75,
					type: "grass",
					category: "status",
				},
				"petal-dance": {
					name: "Petal Dance",
					power: 120,
					accuracy: 100,
					type: "grass",
					category: "special",
				},
				"string-shot": {
					name: "String Shot",
					power: 0,
					accuracy: 95,
					type: "bug",
					category: "status",
				},
				"dragon-rage": {
					name: "Dragon Rage",
					power: 40,
					accuracy: 100,
					type: "dragon",
					category: "special",
				},
				"fire-spin": {
					name: "Fire Spin",
					power: 35,
					accuracy: 85,
					type: "fire",
					category: "special",
				},
				"thunder-shock": {
					name: "Thunder Shock",
					power: 40,
					accuracy: 100,
					type: "electric",
					category: "special",
				},
				"thunder-wave": {
					name: "Thunder Wave",
					power: 0,
					accuracy: 90,
					type: "electric",
					category: "status",
				},
				thunder: {
					name: "Thunder",
					power: 110,
					accuracy: 70,
					type: "electric",
					category: "special",
				},
				"rock-throw": {
					name: "Rock Throw",
					power: 50,
					accuracy: 90,
					type: "rock",
					category: "physical",
				},
				"ice-beam": {
					name: "Ice Beam",
					power: 90,
					accuracy: 100,
					type: "ice",
					category: "special",
				},
				"icy-wind": {
					name: "Icy Wind",
					power: 55,
					accuracy: 95,
					type: "ice",
					category: "special",
				},
				acid: {
					name: "Acid",
					power: 40,
					accuracy: 100,
					type: "poison",
					category: "special",
				},
				psychic: {
					name: "Psychic",
					power: 90,
					accuracy: 100,
					type: "psychic",
					category: "special",
				},
			};

			return (
				moveData_map[moveName] || {
					name: moveName.replace(/-/g, " "),
					power: 50, // Default power
					accuracy: 100,
					type:
						pokemon.types[index % pokemon.types.length]?.type.name || "normal",
					category: "physical",
				}
			);
		})
		.filter((move) => move.power > 0 || move.category === "physical"); // Prefer attacking moves

	// Return at least 4 moves, or as many as available
	return moves.slice(0, 4).length > 0
		? moves.slice(0, 4)
		: [
				{
					name: "Struggle",
					power: 50,
					accuracy: 100,
					type: pokemon.types[0]?.type.name || "normal",
					category: "physical",
				},
			];
};

/**
 * Calculate HP stat based on Pokemon base stats
 */
export const calculateHp = (baseStat: number, level: number): number => {
	return Math.floor((2 * baseStat * level) / 100 + level + BASE_HP_MULTIPLIER);
};

/**
 * Calculate other stats based on Pokemon base stats
 */
export const calculateStat = (baseStat: number, level: number): number => {
	return Math.floor((2 * baseStat * level) / 100 + BASE_STAT_MULTIPLIER);
};

/**
 * Get stat value by name from Pokemon stats array
 */
export const getStatValue = (pokemon: PokemonAPI, statName: string): number => {
	const stat = pokemon.stats.find(
		(s) => s.stat.name.toLowerCase() === statName.toLowerCase(),
	);
	return stat ? stat.base_stat : 0;
};

/**
 * Initialize a battle participant
 */
export const initBattleParticipant = (
	pokemon: PokemonAPI,
): BattleParticipant => {
	const maxHp = calculateHp(getStatValue(pokemon, "hp"), FIXED_LEVEL);
	const moves = extractMovesFromPokemon(pokemon);

	return {
		pokemon,
		currentHp: maxHp,
		maxHp,
		moves,
		level: FIXED_LEVEL,
	};
};

/**
 * Calculate damage dealt by a move
 */
export const calculateDamage = (
	attacker: BattleParticipant,
	move: BattleMove,
	defender: BattleParticipant,
): number => {
	const isPhysical = move.category === "physical";
	const attackStat = isPhysical
		? calculateStat(getStatValue(attacker.pokemon, "attack"), attacker.level)
		: calculateStat(getStatValue(attacker.pokemon, "sp. atk"), attacker.level);

	const defenseStat = isPhysical
		? calculateStat(getStatValue(defender.pokemon, "defense"), defender.level)
		: calculateStat(getStatValue(defender.pokemon, "sp. def"), defender.level);

	const typeEffectiveness = getTypeEffectiveness(
		move.type,
		defender.pokemon.types[0]?.type.name || "normal",
	);

	// Simplified damage formula
	const baseDamage = Math.max(
		1,
		Math.floor((2 * move.power * attackStat) / (5 * defenseStat) + 2),
	);

	const randomFactor = 0.85 + Math.random() * 0.15; // 0.85 to 1.0
	const damage = Math.floor(baseDamage * typeEffectiveness * randomFactor);

	return Math.max(1, damage);
};

/**
 * Select a random attacking move
 */
export const selectRandomMove = (
	participant: BattleParticipant,
): BattleMove => {
	const validMoves = participant.moves.filter((m) => m.power > 0);
	return validMoves.length > 0
		? validMoves[Math.floor(Math.random() * validMoves.length)]
		: participant.moves[0];
};

/**
 * Initialize battle state between player and opponent
 */
export const initBattle = (
	playerPokemon: PokemonAPI,
	opponentPokemon: PokemonAPI,
): BattleState => {
	const player = initBattleParticipant(playerPokemon);
	const opponent = initBattleParticipant(opponentPokemon);

	const playerSpeed = calculateStat(
		getStatValue(playerPokemon, "speed"),
		FIXED_LEVEL,
	);
	const opponentSpeed = calculateStat(
		getStatValue(opponentPokemon, "speed"),
		FIXED_LEVEL,
	);

	const isPlayerTurn = playerSpeed >= opponentSpeed;

	return {
		player,
		opponent,
		round: 1,
		playerHp: player.currentHp,
		opponentHp: opponent.currentHp,
		isPlayerTurn,
		gameOver: false,
		winner: null,
		battleLog: [],
		playerSpeed,
		opponentSpeed,
	};
};

/**
 * Execute a turn in battle
 */
export const executeBattleTurn = (
	state: BattleState,
	playerMove: BattleMove | null,
): { newState: BattleState; action: BattleAction } => {
	const newState = { ...state };

	let actor: "player" | "opponent";
	let moveName: string;
	let attacker: BattleParticipant;
	let defender: BattleParticipant;

	if (newState.isPlayerTurn && playerMove) {
		actor = "player";
		moveName = playerMove.name;
		attacker = newState.player;
		defender = newState.opponent;
	} else {
		actor = "opponent";
		const opponentMove = selectRandomMove(newState.opponent);
		moveName = opponentMove.name;
		attacker = newState.opponent;
		defender = newState.player;
	}

	const move =
		attacker.moves.find((m) => m.name === moveName) || attacker.moves[0];
	const damage = calculateDamage(attacker, move, defender);
	const typeEffectiveness = getTypeEffectiveness(
		move.type,
		defender.pokemon.types[0]?.type.name || "normal",
	);

	// Apply damage
	if (actor === "player") {
		newState.opponentHp = Math.max(0, newState.opponentHp - damage);
	} else {
		newState.playerHp = Math.max(0, newState.playerHp - damage);
	}

	// Check win condition
	if (newState.playerHp <= 0) {
		newState.gameOver = true;
		newState.winner = "opponent";
	} else if (newState.opponentHp <= 0) {
		newState.gameOver = true;
		newState.winner = "player";
	}

	// Create action log
	const message =
		`${attacker.pokemon.name} used ${moveName}! ${damage} damage dealt.` +
		(typeEffectiveness !== 1
			? ` ${getEffectivenessLabel(typeEffectiveness)}`
			: "");

	const action: BattleAction = {
		actor,
		moveName,
		damage,
		typeEffectiveness,
		message,
		timestamp: Date.now(),
	};

	newState.battleLog.push(action);

	// Switch turn if game is not over
	if (!newState.gameOver) {
		newState.isPlayerTurn = !newState.isPlayerTurn;
		newState.round += 1;
	}

	return { newState, action };
};

/**
 * Get battle result
 */
export const getBattleResult = (state: BattleState): BattleResult => {
	const playerMove = state.battleLog.filter((a) => a.actor === "player");
	const opponentMove = state.battleLog.filter((a) => a.actor === "opponent");

	const playerDamage = playerMove.reduce((sum, a) => sum + a.damage, 0);
	const opponentDamage = opponentMove.reduce((sum, a) => sum + a.damage, 0);

	return {
		winner: state.winner || "player",
		loser: state.winner === "player" ? "opponent" : "player",
		roundsPlayed: state.round,
		playerDamageDealt: playerDamage,
		opponentDamageDealt: opponentDamage,
		battleLog: state.battleLog.slice(-20),
		playerPokemon: {
			id: state.player.pokemon.id,
			name: state.player.pokemon.name,
			imageUrl:
				state.player.pokemon.sprites.other?.["official-artwork"]
					?.front_default || state.player.pokemon.sprites.front_default,
		},
		opponentPokemon: {
			id: state.opponent.pokemon.id,
			name: state.opponent.pokemon.name,
			imageUrl:
				state.opponent.pokemon.sprites.other?.["official-artwork"]
					?.front_default || state.opponent.pokemon.sprites.front_default,
		},
		timestamp: Date.now(),
	};
};
