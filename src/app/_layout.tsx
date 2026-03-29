import { Stack } from "expo-router";
import { ThemeProvider } from "@/src/context/ThemeContext";

export default function RootLayout() {
	return (
		<ThemeProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="Screens/Settings" />
				<Stack.Screen name="Screens/BattleSelection" />
				<Stack.Screen name="Screens/BattleArena" />
				<Stack.Screen name="Screens/BattleResults" />
				<Stack.Screen name="Screens/BattleHistory" />
			</Stack>
		</ThemeProvider>
	);
}
