import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BattleResultErrorStateProps {
	textColor: string;
}

const BattleResultErrorState = ({ textColor }: BattleResultErrorStateProps) => {
	return (
		<View style={styles.centerContainer}>
			<Text style={[styles.errorText, { color: textColor }]}>
				Error loading results
			</Text>
		</View>
	);
};

export default BattleResultErrorState;

const styles = StyleSheet.create({
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		fontWeight: "500",
	},
});
