import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Grid = () => {
	return (
		<>
			<View style={[styles.gridVertical, { left: "33.33%" }]} />
			<View style={[styles.gridVertical, { left: "66.66%" }]} />
			<View style={[styles.gridHorizontal, { top: "33.33%" }]} />
			<View style={[styles.gridHorizontal, { top: "66.66%" }]} />
		</>
	);
};

export default Grid;

const styles = StyleSheet.create({
  	gridVertical: {
		position: "absolute",
		width: 1,
		height: "100%",
		backgroundColor: "rgba(255, 255, 255, 0.42)",
	},
	gridHorizontal: {
		position: "absolute",
		height: 1,
		width: "100%",
		backgroundColor: "rgba(255,255,255,0.42)",
	},
});
