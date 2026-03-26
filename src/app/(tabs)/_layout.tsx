import { Tabs } from "expo-router";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
	const { colors } = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#EF5350",
				tabBarInactiveTintColor: colors.mutedText,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
				},
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "All Pokémon",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="list" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="favorites"
				options={{
					title: "Favorites",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
