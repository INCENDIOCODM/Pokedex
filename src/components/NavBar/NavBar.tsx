import { Pressable, View, StyleSheet } from "react-native";
import { useLinkBuilder } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Animated, {
	FadeIn,
	FadeOut,
	LinearTransition,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomNavbar: React.FC<BottomTabBarProps> = ({
	state,
	descriptors,
	navigation,
}) => {
	const { buildHref } = useLinkBuilder();
	const router = useRouter();

	const PrimaryColor = "#000000ff";
	const SecondaryColor = "#ffffffff";
	const groupedRoutes = state.routes;

	return (
		<View style={styles.container}>
			<View style={styles.pillGroup}>
				{groupedRoutes.map((route) => {
					const { options } = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
								? options.title
								: route.name;

					const isFocused =
						state.index ===
						state.routes.findIndex((item) => item.key === route.key);

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params);
						}
					};

					return (
						<AnimatedPressable
							key={route.key}
							layout={LinearTransition.springify()
								.mass(0.5)
								.damping(20)
								.stiffness(90)}
							// @ts-ignore
							href={buildHref(route.name, route.params)}
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarButtonTestID}
							onPress={onPress}
							style={[styles.button, isFocused && styles.isFocusedButton]}>
							{getIconByRouteName(
								route.name,
								isFocused ? PrimaryColor : SecondaryColor,
							)}
							{isFocused && (
								<Animated.Text
									style={[styles.text, isFocused && styles.isFocusedText]}
									entering={FadeIn.duration(200)}
									exiting={FadeOut.duration(200)}>
									{label as string}
								</Animated.Text>
							)}
						</AnimatedPressable>
					);
				})}
			</View>

			<AnimatedPressable
				layout={LinearTransition.springify()
					.mass(0.5)
					.damping(20)
					.stiffness(90)}
				onPress={() => router.push("/camera")}
				style={styles.cameraButton}>
				<Ionicons name="camera" size={30} color={SecondaryColor} />
			</AnimatedPressable>
		</View>
	);
};

function getIconByRouteName(routeName: string, color: string) {
	switch (routeName) {
		case "index":
			return <Feather name="home" size={18} color={color} />;
		case "favorites":
			return <MaterialIcons name="catching-pokemon" size={18} color={color} />;
		case "camera":
			return <MaterialIcons name="camera" size={18} color={color} />;
		case "battle":
			return <Ionicons name="flame-outline" size={18} color={color} />;
		default:
			return <Feather name="home" size={18} color={color} />;
	}
}

export default CustomNavbar;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		bottom: 28,
		width: "92%",
		height: 78,
		position: "absolute",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
	pillGroup: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		flex: 1,
		height: 60,
		backgroundColor: "#EF5350",
		borderRadius: 24,
		paddingHorizontal: 10,
		paddingVertical: 8,
		marginRight: 10,
		overflow: "hidden",
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 10,
		flexDirection: "row",
		gap: 4,
		flex: 1,
		minWidth: 0,
	},
	isFocusedButton: {
		backgroundColor: "rgb(254, 254, 254)",
		borderRadius: 16,
		marginHorizontal: 0,
		flex: 1.6,
	},
	text: {
		fontSize: 12,
		fontWeight: "bold",
	},
	isFocusedText: {
		color: "rgb(201, 98, 24)",
		overflow: "hidden",
	},
	cameraButton: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#EF5350",
		borderWidth: 5,
		borderColor: "#fff",
		marginLeft: 4,
		elevation: 12,
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 12,
	},
	cameraButtonFocused: {
		backgroundColor: "#fff",
	},
});
