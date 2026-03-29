import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
	ActivityIndicator,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, {
	Easing,
	cancelAnimation,
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import {
	getCachedPokemonById,
	getRandomCachedPokemon,
	upsertPokemon,
} from "@/src/functions/PokemonCacheDb";
import { featchPokemonData } from "@/src/functions/ApiCalls";
import type { PokemonAPI } from "@/src/interface/PokeAPInterface";
import type {
	BattleState,
	BattleAction,
	BattleMove,
} from "@/src/interface/BattleInterface";
import {
	initBattle,
	executeBattleTurn,
	getBattleResult,
} from "@/src/functions/BattleEngine";
import typeColors from "@/src/components/Pokemontype/poketype";

const TURN_ANIMATION_DELAY_MS = 350;
const PLAYER_TO_AI_LATENCY_MS = 500;
const SHAKE_DISTANCE = 10;
const SUPER_EFFECTIVE_THRESHOLD = 2;
const IMPACT_POPUP_TOTAL_MS = 620;
const GEN_ONE_MIN_ID = 1;
const GEN_ONE_MAX_ID = 151;
const OPPONENT_CACHE_LOOKUP_ATTEMPTS = 8;
const OPPONENT_API_LOOKUP_ATTEMPTS = 6;
const RECENT_OPPONENT_HISTORY_SIZE = 5;
const LIGHT_TYPE_SET = new Set(["electric", "ice", "fairy", "normal", "water"]);

const getTypeColor = (type: string): string => {
	const normalized = type.toLowerCase();
	const color = typeColors[normalized as keyof typeof typeColors];
	return color || "#8E8E93";
};

const getTypeTextColor = (type: string): string => {
	return LIGHT_TYPE_SET.has(type.toLowerCase()) ? "#1F2937" : "#FFFFFF";
};

const formatTypeLabel = (type: string): string => {
	if (!type) return "Normal";
	return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const getRandomGenOneId = (): number =>
	Math.floor(Math.random() * GEN_ONE_MAX_ID) + GEN_ONE_MIN_ID;

const getRandomGenOneIdExcluding = (excludedIds: Set<number>): number => {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		const candidateId = getRandomGenOneId();
		if (!excludedIds.has(candidateId)) {
			return candidateId;
		}
	}

	return getRandomGenOneId();
};

const BattleArena = () => {
	const router = useRouter();
	const { colors } = useTheme();
	const { pokemonId } = useLocalSearchParams();
	const { height: screenHeight } = useWindowDimensions();
	const isCompactHeight = screenHeight < 760;

	const [loading, setLoading] = useState(true);
	const [battleState, setBattleState] = useState<BattleState | null>(null);
	const [selectedMove, setSelectedMove] = useState<BattleMove | null>(null);
	const [executing, setExecuting] = useState(false);
	const [lastAction, setLastAction] = useState<BattleAction | null>(null);
	const [impactTarget, setImpactTarget] = useState<
		"player" | "opponent" | null
	>(null);
	const [impactLabel, setImpactLabel] = useState("");
	const [impactEmoji, setImpactEmoji] = useState("");
	const recentOpponentIdsRef = useRef<number[]>([]);
	const impactHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const opponentShakeX = useSharedValue(0);
	const playerShakeX = useSharedValue(0);
	const impactOpacity = useSharedValue(0);
	const impactTranslateY = useSharedValue(10);
	const impactScale = useSharedValue(0.85);

	const opponentShakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: opponentShakeX.value }],
	}));

	const playerShakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: playerShakeX.value }],
	}));

	const impactBadgeStyle = useAnimatedStyle(() => ({
		opacity: impactOpacity.value,
		transform: [
			{ translateY: impactTranslateY.value },
			{ scale: impactScale.value },
		],
	}));

	const clearImpactPopup = useCallback(() => {
		setImpactTarget(null);
		setImpactLabel("");
		setImpactEmoji("");
	}, []);

	useEffect(() => {
		return () => {
			if (impactHideTimeoutRef.current) {
				clearTimeout(impactHideTimeoutRef.current);
			}
		};
	}, []);

	const runHitShake = useCallback((shakeX: SharedValue<number>) => {
		cancelAnimation(shakeX);
		shakeX.value = 0;

		shakeX.value = withSequence(
			withTiming(SHAKE_DISTANCE, {
				duration: 40,
				easing: Easing.linear,
			}),
			withTiming(-SHAKE_DISTANCE, {
				duration: 40,
				easing: Easing.linear,
			}),
			withTiming(SHAKE_DISTANCE * 0.7, {
				duration: 35,
				easing: Easing.linear,
			}),
			withTiming(-SHAKE_DISTANCE * 0.7, {
				duration: 35,
				easing: Easing.linear,
			}),
			withTiming(0, {
				duration: 30,
				easing: Easing.linear,
			}),
		);
	}, []);

	const showImpactPopup = useCallback(
		(target: "player" | "opponent", typeEffectiveness: number) => {
			if (typeEffectiveness < SUPER_EFFECTIVE_THRESHOLD) {
				return;
			}

			setImpactTarget(target);
			setImpactLabel("Super Effective!");
			setImpactEmoji("💥");

			cancelAnimation(impactOpacity);
			cancelAnimation(impactTranslateY);
			cancelAnimation(impactScale);

			impactOpacity.value = 0;
			impactTranslateY.value = 10;
			impactScale.value = 0.85;

			impactOpacity.value = withSequence(
				withTiming(1, {
					duration: 120,
					easing: Easing.out(Easing.quad),
				}),
				withDelay(
					260,
					withTiming(0, {
						duration: 220,
						easing: Easing.in(Easing.quad),
					}),
				),
			);

			impactTranslateY.value = withSequence(
				withTiming(0, {
					duration: 120,
					easing: Easing.out(Easing.quad),
				}),
				withDelay(
					260,
					withTiming(-16, {
						duration: 220,
						easing: Easing.in(Easing.quad),
					}),
				),
			);

			impactScale.value = withSequence(
				withSpring(1.05, {
					damping: 12,
					stiffness: 220,
					mass: 0.6,
				}),
				withDelay(
					260,
					withTiming(1.2, {
						duration: 220,
						easing: Easing.out(Easing.quad),
					}),
				),
			);

			if (impactHideTimeoutRef.current) {
				clearTimeout(impactHideTimeoutRef.current);
			}

			impactHideTimeoutRef.current = setTimeout(() => {
				clearImpactPopup();
			}, IMPACT_POPUP_TOTAL_MS);
		},
		[clearImpactPopup, impactOpacity, impactScale, impactTranslateY],
	);

	const rememberOpponentId = useCallback((pokemonId: number) => {
		recentOpponentIdsRef.current = [
			pokemonId,
			...recentOpponentIdsRef.current.filter((id) => id !== pokemonId),
		].slice(0, RECENT_OPPONENT_HISTORY_SIZE);
	}, []);

	const selectOpponentPokemon = useCallback(
		async (playerPokemonId: number): Promise<PokemonAPI | null> => {
			const excludedIds = new Set<number>([
				playerPokemonId,
				...recentOpponentIdsRef.current,
			]);

			// Prefer cache hits for speed, but sample IDs broadly to avoid repetitive opponents.
			for (
				let attempt = 0;
				attempt < OPPONENT_CACHE_LOOKUP_ATTEMPTS;
				attempt += 1
			) {
				const randomId = getRandomGenOneIdExcluding(excludedIds);
				excludedIds.add(randomId);
				const cached = await getCachedPokemonById(randomId);
				if (cached?.pokemon) {
					rememberOpponentId(cached.pokemon.id);
					return cached.pokemon;
				}
			}

			// Cache is sparse or misses random IDs; try API to steadily diversify and warm cache.
			for (
				let attempt = 0;
				attempt < OPPONENT_API_LOOKUP_ATTEMPTS;
				attempt += 1
			) {
				const randomId = getRandomGenOneIdExcluding(excludedIds);
				excludedIds.add(randomId);

				try {
					const fetched = await featchPokemonData(
						`https://pokeapi.co/api/v2/pokemon/${randomId}`,
					);
					if (fetched && fetched.id !== playerPokemonId) {
						await upsertPokemon(fetched, Date.now());
						rememberOpponentId(fetched.id);
						return fetched;
					}
				} catch {
					// Keep trying alternate random IDs.
				}
			}

			// Last fallback: whatever random cached opponent we have.
			const cachedFallback = await getRandomCachedPokemon(playerPokemonId);
			if (cachedFallback?.pokemon) {
				rememberOpponentId(cachedFallback.pokemon.id);
				return cachedFallback.pokemon;
			}

			return null;
		},
		[rememberOpponentId],
	);

	const initializeBattle = useCallback(async () => {
		try {
			setLoading(true);
			const playerPokemonId = pokemonId
				? parseInt(pokemonId as string, 10)
				: null;

			if (!playerPokemonId) {
				console.error("No Pokemon ID provided");
				router.back();
				return;
			}

			const playerData = await getCachedPokemonById(playerPokemonId);
			if (!playerData) {
				console.error("Player Pokemon not found in cache");
				router.back();
				return;
			}

			const opponentPokemon = await selectOpponentPokemon(playerPokemonId);

			if (!opponentPokemon) {
				console.error("Could not fetch opponent Pokemon");
				router.back();
				return;
			}

			setBattleState(initBattle(playerData.pokemon, opponentPokemon));
		} catch (error) {
			console.error("Failed to initialize battle", error);
			router.back();
		} finally {
			setLoading(false);
		}
	}, [pokemonId, router, selectOpponentPokemon]);

	useEffect(() => {
		initializeBattle();
	}, [initializeBattle]);

	useEffect(() => {
		if (!lastAction) return;

		const target = lastAction.actor === "player" ? "opponent" : "player";
		const shakeX = target === "opponent" ? opponentShakeX : playerShakeX;

		runHitShake(shakeX);
		showImpactPopup(target, lastAction.typeEffectiveness);
	}, [lastAction, opponentShakeX, playerShakeX, runHitShake, showImpactPopup]);

	const handleAttack = async (move: BattleMove) => {
		if (!battleState || executing || battleState.gameOver) return;

		setExecuting(true);
		setSelectedMove(move);

		try {
			const { newState: afterPlayer, action: playerAction } = executeBattleTurn(
				battleState,
				move,
			);
			setLastAction(playerAction);
			setBattleState(afterPlayer);

			await new Promise((resolve) =>
				setTimeout(resolve, PLAYER_TO_AI_LATENCY_MS),
			);

			if (afterPlayer.gameOver) {
				return;
			}

			const { newState: afterOpponent, action: opponentAction } =
				executeBattleTurn(afterPlayer, null);
			setLastAction(opponentAction);
			setBattleState(afterOpponent);

			await new Promise((resolve) =>
				setTimeout(resolve, TURN_ANIMATION_DELAY_MS),
			);

			if (afterOpponent.gameOver) {
				return;
			}
		} catch (error) {
			console.error("Error during battle turn", error);
		} finally {
			setExecuting(false);
			setSelectedMove(null);
		}
	};

	const handleOpponentAutoTurn = useCallback(async (state: BattleState) => {
		setExecuting(true);

		try {
			await new Promise((resolve) =>
				setTimeout(resolve, PLAYER_TO_AI_LATENCY_MS),
			);

			const { newState: afterOpponent, action: opponentAction } =
				executeBattleTurn(state, null);
			setLastAction(opponentAction);
			setBattleState(afterOpponent);

			await new Promise((resolve) =>
				setTimeout(resolve, TURN_ANIMATION_DELAY_MS),
			);
		} catch (error) {
			console.error("Error during auto opponent turn", error);
		} finally {
			setExecuting(false);
			setSelectedMove(null);
		}
	}, []);

	useEffect(() => {
		if (
			!battleState ||
			battleState.gameOver ||
			battleState.isPlayerTurn ||
			executing
		) {
			return;
		}

		void handleOpponentAutoTurn(battleState);
	}, [battleState, executing, handleOpponentAutoTurn]);

	if (loading) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}>
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={colors.accent} />
				</View>
			</SafeAreaView>
		);
	}

	if (!battleState) {
		return (
			<SafeAreaView
				style={[styles.container, { backgroundColor: colors.background }]}>
				<View style={styles.centerContainer}>
					<Text style={[styles.errorText, { color: colors.text }]}>
						Failed to load battle
					</Text>
					<TouchableOpacity
						style={[styles.button, { backgroundColor: colors.accent }]}
						onPress={() => router.back()}>
						<Text style={styles.buttonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	const playerPokemon = battleState.player.pokemon;
	const opponentPokemon = battleState.opponent.pokemon;
	const playerHpPercent =
		(battleState.playerHp / battleState.player.maxHp) * 100;
	const opponentHpPercent =
		(battleState.opponentHp / battleState.opponent.maxHp) * 100;

	const playerImage =
		playerPokemon.sprites.other?.["official-artwork"]?.front_default ||
		playerPokemon.sprites.front_default;
	const opponentImage =
		opponentPokemon.sprites.other?.["official-artwork"]?.front_default ||
		opponentPokemon.sprites.front_default;

	const statusTitle = battleState.gameOver
		? battleState.winner === "player"
			? "You Won"
			: "Opponent Won"
		: battleState.isPlayerTurn
			? "Your Turn"
			: "Opponent Turn";
	const statusColor = battleState.gameOver
		? battleState.winner === "player"
			? "#4CAF50"
			: "#FF6B6B"
		: colors.text;

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={[styles.arena, isCompactHeight && styles.arenaCompact]}>
				<View
					style={[
						styles.topSection,
						isCompactHeight && styles.topSectionCompact,
					]}>
					<View
						style={[
							styles.pokemonSection,
							styles.enemyCard,
							isCompactHeight && styles.pokemonSectionCompact,
							{ backgroundColor: colors.surface, borderColor: colors.border },
						]}>
						<View
							style={[
								styles.pokemon,
								isCompactHeight && styles.pokemonCompact,
							]}>
							{impactTarget === "opponent" ? (
								<Animated.View style={[styles.impactBadge, impactBadgeStyle]}>
									<Text style={styles.impactEmoji}>{impactEmoji}</Text>
									<Text style={styles.impactText}>{impactLabel}</Text>
								</Animated.View>
							) : null}
							<Animated.View style={opponentShakeStyle}>
								{opponentImage && (
									<Image
										source={{ uri: opponentImage }}
										style={[
											styles.sprite,
											isCompactHeight && styles.spriteCompact,
										]}
										resizeMode="contain"
									/>
								)}
							</Animated.View>
							<Text style={[styles.pokemonName, { color: colors.text }]}>
								{opponentPokemon.name}
							</Text>
						</View>

						<View style={styles.hpSection}>
							<View style={styles.hpLabel}>
								<Text style={[styles.hpText, { color: colors.mutedText }]}>
									HP
								</Text>
								<Text style={[styles.hpValue, { color: colors.text }]}>
									{Math.max(0, battleState.opponentHp)}/
									{battleState.opponent.maxHp}
								</Text>
							</View>
							<View
								style={[styles.hpBar, { backgroundColor: colors.surfaceAlt }]}>
								<View
									style={[
										styles.hpFill,
										{
											width: `${Math.max(0, opponentHpPercent)}%`,
											backgroundColor:
												opponentHpPercent > 25 ? "#4CAF50" : "#FF6B6B",
										},
									]}
								/>
							</View>
						</View>
					</View>

					<View style={styles.enemyMovesSection}>
						<Text style={[styles.movesTitle, { color: colors.mutedText }]}>
							Enemy Moves
						</Text>
						<View style={styles.enemyMovesWrap}>
							{battleState.opponent.moves.map((move, index) => {
								const isLastEnemyMove =
									lastAction?.actor === "opponent" &&
									lastAction.moveName === move.name;

								return (
									<View
										key={`enemy-${move.name}-${index}`}
										style={[
											styles.enemyMovePill,
											isCompactHeight && styles.enemyMovePillCompact,
											{
												backgroundColor: colors.surface,
												borderColor: isLastEnemyMove
													? colors.accent
													: colors.border,
											},
										]}>
										<Text
											style={[styles.enemyMoveName, { color: colors.text }]}
											numberOfLines={1}>
											{move.name}
										</Text>
										<View
											style={[
												styles.typeChip,
												{ backgroundColor: getTypeColor(move.type) },
											]}>
											<Text style={styles.typeChipText} numberOfLines={1}>
												{formatTypeLabel(move.type)}
											</Text>
										</View>
									</View>
								);
							})}
						</View>
					</View>

					<View
						style={[
							styles.statusBanner,
							{
								backgroundColor: colors.surfaceAlt,
								borderColor: colors.border,
							},
						]}>
						<Text style={[styles.statusTitle, { color: statusColor }]}>
							{statusTitle}
						</Text>
						<Text
							style={[styles.statusMessage, { color: colors.mutedText }]}
							numberOfLines={1}>
							{lastAction ? lastAction.message : "Select a move to attack"}
						</Text>
					</View>
				</View>

				<View
					style={[
						styles.bottomSection,
						isCompactHeight && styles.bottomSectionCompact,
					]}>
					<View
						style={[
							styles.pokemonSection,
							styles.playerCard,
							isCompactHeight && styles.pokemonSectionCompact,
							{ backgroundColor: colors.surface, borderColor: colors.border },
						]}>
						<View
							style={[
								styles.pokemon,
								isCompactHeight && styles.pokemonCompact,
							]}>
							{impactTarget === "player" ? (
								<Animated.View style={[styles.impactBadge, impactBadgeStyle]}>
									<Text style={styles.impactEmoji}>{impactEmoji}</Text>
									<Text style={styles.impactText}>{impactLabel}</Text>
								</Animated.View>
							) : null}
							<Animated.View style={playerShakeStyle}>
								{playerImage && (
									<Image
										source={{ uri: playerImage }}
										style={[
											styles.sprite,
											isCompactHeight && styles.spriteCompact,
										]}
										resizeMode="contain"
									/>
								)}
							</Animated.View>
							<Text style={[styles.pokemonName, { color: colors.text }]}>
								{playerPokemon.name}
							</Text>
						</View>

						<View style={styles.hpSection}>
							<View style={styles.hpLabel}>
								<Text style={[styles.hpText, { color: colors.mutedText }]}>
									HP
								</Text>
								<Text style={[styles.hpValue, { color: colors.text }]}>
									{Math.max(0, battleState.playerHp)}/{battleState.player.maxHp}
								</Text>
							</View>
							<View
								style={[styles.hpBar, { backgroundColor: colors.surfaceAlt }]}>
								<View
									style={[
										styles.hpFill,
										{
											width: `${Math.max(0, playerHpPercent)}%`,
											backgroundColor:
												playerHpPercent > 25 ? "#4CAF50" : "#FF6B6B",
										},
									]}
								/>
							</View>
						</View>
					</View>

					{!battleState.gameOver ? (
						<View style={styles.playerMovesSection}>
							<Text style={[styles.movesTitle, { color: colors.mutedText }]}>
								Moves
							</Text>
							<View style={styles.movesGrid}>
								{battleState.player.moves.map((move, index) => {
									const moveColor = getTypeColor(move.type);
									const moveTextColor = getTypeTextColor(move.type);

									return (
										<TouchableOpacity
											key={`${move.name}-${index}`}
											style={[
												styles.moveButton,
												isCompactHeight && styles.moveButtonCompact,
												{
													backgroundColor: moveColor,
													borderColor: moveColor,
													opacity:
														!battleState.isPlayerTurn ||
														executing ||
														selectedMove?.name === move.name
															? 0.55
															: 0.96,
												},
											]}
											onPress={() => handleAttack(move)}
											disabled={!battleState.isPlayerTurn || executing}>
											<Text
												style={[
													styles.playerMoveType,
													{ color: moveTextColor },
												]}
												numberOfLines={1}>
												[{formatTypeLabel(move.type)}]
											</Text>
											<Text
												style={[
													styles.playerMoveName,
													{ color: moveTextColor },
												]}
												numberOfLines={1}>
												{move.name}
											</Text>
											<Text
												style={[styles.movePower, { color: moveTextColor }]}
												numberOfLines={1}>
												Power: {move.power}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					) : (
						<View style={styles.endgameSection}>
							<TouchableOpacity
								style={[styles.button, { backgroundColor: colors.accent }]}
								onPress={async () => {
									const result = getBattleResult(battleState);
									router.push({
										pathname: "../Screens/BattleResults",
										params: {
											result: JSON.stringify(result),
										},
									});
								}}>
								<Text style={styles.buttonText}>View Results</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
		</SafeAreaView>
	);
};

export default BattleArena;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		marginBottom: 16,
		fontWeight: "500",
	},
	arena: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 10,
		gap: 10,
		justifyContent: "space-between",
	},
	arenaCompact: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		gap: 8,
	},
	topSection: {
		flex: 0.48,
		minHeight: 0,
		gap: 8,
	},
	topSectionCompact: {
		gap: 6,
	},
	bottomSection: {
		flex: 0.52,
		minHeight: 0,
		gap: 8,
	},
	bottomSectionCompact: {
		gap: 6,
	},
	pokemonSection: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 20,
		borderWidth: 1,
	},
	pokemonSectionCompact: {
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 16,
	},
	enemyCard: {
		paddingTop: 8,
		paddingBottom: 10,
	},
	playerCard: {
		paddingTop: 8,
		paddingBottom: 10,
	},
	pokemon: {
		alignItems: "center",
		marginBottom: 6,
		position: "relative",
	},
	pokemonCompact: {
		marginBottom: 4,
	},
	impactBadge: {
		position: "absolute",
		top: -10,
		zIndex: 10,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FF7043",
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	impactEmoji: {
		fontSize: 12,
		marginRight: 4,
	},
	impactText: {
		fontSize: 11,
		fontWeight: "800",
		color: "white",
		letterSpacing: 0.2,
	},
	sprite: {
		width: 82,
		height: 82,
	},
	spriteCompact: {
		width: 68,
		height: 68,
	},
	pokemonName: {
		fontSize: 15,
		fontWeight: "600",
		marginTop: 2,
		textTransform: "capitalize",
	},
	hpSection: {
		gap: 5,
	},
	hpLabel: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	hpText: {
		fontSize: 12,
		fontWeight: "500",
	},
	hpValue: {
		fontSize: 12,
		fontWeight: "600",
	},
	hpBar: {
		height: 14,
		borderRadius: 8,
		overflow: "hidden",
	},
	hpFill: {
		height: "100%",
		borderRadius: 8,
	},
	enemyMovesSection: {
		gap: 5,
	},
	movesTitle: {
		fontSize: 13,
		fontWeight: "600",
		marginBottom: 2,
	},
	enemyMovesWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 5,
	},
	enemyMovePill: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		borderWidth: 1,
		gap: 6,
	},
	enemyMovePillCompact: {
		paddingHorizontal: 6,
		paddingVertical: 3,
		gap: 4,
	},
	enemyMoveName: {
		fontSize: 11,
		fontWeight: "600",
		maxWidth: 110,
		textTransform: "capitalize",
	},
	typeChip: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 999,
	},
	typeChipText: {
		fontSize: 9,
		fontWeight: "700",
		color: "white",
		letterSpacing: 0.2,
	},
	statusBanner: {
		borderRadius: 10,
		borderWidth: 1,
		marginTop: "10%",
		paddingHorizontal: 10,
		paddingVertical: 7,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 56,
	},
	statusTitle: {
		fontSize: 18,
		fontWeight: "700",
		lineHeight: 22,
	},
	statusMessage: {
		fontSize: 12,
		fontWeight: "500",
		lineHeight: 16,
		marginTop: 1,
	},
	playerMovesSection: {
		flex: 1,
		minHeight: 0,
		gap: 6,
	},
	movesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	moveButton: {
		flex: 1,
		minWidth: "48%",
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 14,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 78,
	},
	moveButtonCompact: {
		minHeight: 70,
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	playerMoveType: {
		fontSize: 11,
		fontWeight: "700",
		marginBottom: 2,
	},
	playerMoveName: {
		fontSize: 20,
		fontWeight: "600",
		textTransform: "capitalize",
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 2,
	},
	movePower: {
		fontSize: 12,
		fontWeight: "500",
	},
	endgameSection: {
		flex: 1,
		justifyContent: "center",
	},
	button: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
});
