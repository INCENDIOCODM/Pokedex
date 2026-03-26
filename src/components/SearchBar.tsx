import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/src/context/ThemeContext";

interface SearchBarProps {
	searchQuery?: string;
	setSearchQuery?: (query: string) => void;
	rows?: number | string | undefined;
	setRows?: (rows: number) => void;
	onPressSettings?: () => void;
}

const loop = () => {};

const SearchBar = ({
	searchQuery = "",
	setSearchQuery = loop,
	rows = 2,
	setRows = loop,
	onPressSettings,
}: SearchBarProps) => {
	const { colors } = useTheme();
	const normalizedRows: 1 | 2 = Number(rows) === 1 ? 1 : 2;

	const persistListView = async (value: 1 | 2): Promise<void> => {
		try {
			await AsyncStorage.setItem("ListView", String(value));
		} catch (e) {
			console.error("Error storing ListView", e);
		}
	};

	useEffect(() => {
		const loadListView = async () => {
			try {
				const v = await AsyncStorage.getItem("ListView");
				if (v !== null) {
					const n = parseInt(v, 10);
					if (!isNaN(n)) setRows(n === 1 ? 1 : 2);
				}
			} catch (e) {
				console.error("Error loading ListView", e);
			}
		};

		loadListView();
	}, [setRows]);

	return (
		<View>
			<View
				style={[
					styles.headerContainer,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				<View style={styles.titleSection}>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
						<Text style={[styles.titleText, { color: colors.accent }]}>
							Pokédex
						</Text>
						<MaterialCommunityIcons
							name="pokeball"
							color={colors.accent}
							size={40}
							style={{ marginTop: 5 }}
						/>
					</View>
					<Text style={[styles.subtitleText, { color: colors.mutedText }]}>
						Catch &apos;em all!
					</Text>
				</View>
			</View>

			{/* Search & Filter Bar */}
			<View
				style={[
					styles.toolbarContainer,
					{ backgroundColor: colors.surface, borderBottomColor: colors.border },
				]}>
				{/* Search Bar */}
				<View
					style={[
						styles.searchBarWrapper,
						{ backgroundColor: colors.surfaceAlt, borderColor: colors.border },
					]}>
					<Ionicons name="search" size={20} color={colors.accent} />
					<TextInput
						placeholder="Search Pokémon"
						placeholderTextColor={colors.mutedText}
						value={searchQuery}
						onChangeText={(text) => setSearchQuery(text.toLowerCase())}
						style={[styles.searchInput, { color: colors.text }]}
					/>
					{searchQuery !== "" && (
						<Pressable onPress={() => setSearchQuery("")}>
							<Ionicons name="close-circle" size={20} color={colors.accent} />
						</Pressable>
					)}
				</View>

				<Pressable
					style={({ pressed }) => [
						styles.secondaryButton,
						{ backgroundColor: colors.surfaceAlt, borderColor: colors.border },
						pressed && styles.secondaryButtonPressed,
					]}
					onPress={onPressSettings}>
					<Ionicons name="settings-outline" size={24} color={colors.text} />
				</Pressable>

				{/* Grid Toggle Button */}
				<Pressable
					style={({ pressed }) => [
						styles.toggleButton,
						{ backgroundColor: colors.accent },
						pressed && styles.toggleButtonPressed,
					]}
					onPress={async () => {
						const next: 1 | 2 = normalizedRows === 1 ? 2 : 1;
						await persistListView(next);
						setRows(next);
					}}>
					<Ionicons
						name={normalizedRows === 1 ? "list" : "grid"}
						size={30}
						color={colors.onAccent}
					/>
				</Pressable>
			</View>
		</View>
	);
};

export default SearchBar;

const styles = StyleSheet.create({
	toolbarContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 10,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	searchBarWrapper: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	searchInput: {
		flex: 1,
		marginHorizontal: 8,
		fontSize: 16,
		color: "#333",
	},
	headerContainer: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	titleSection: {
		marginBottom: 1,
	},
	subtitleText: {
		fontSize: 14,
		color: "#888",
		marginTop: 4,
	},
	toggleButton: {
		width: 56,
		height: 56,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3,
	},
	toggleButtonPressed: {
		opacity: 0.85,
		elevation: 1,
	},
	secondaryButton: {
		width: 56,
		height: 56,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	secondaryButtonPressed: {
		opacity: 0.75,
	},
	titleText: {
		fontSize: 32,
		fontWeight: "700",
		letterSpacing: 1,
	},
});
