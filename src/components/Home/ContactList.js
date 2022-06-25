import React from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../slices/themeSlice";
import { styled } from "@stitches/react";

function Contact({ onClick, children }) {
	const theme = useSelector(selectTheme);
	const StyledContact = styled("div", {
		position: "relative",
		width: "100%",
		height: "4.5em",
		display: "flex",
		alignItems: "center",
        color: theme.contrast ? "black" : "white",
		"&:hover": {
			cursor: "pointer",
		},

		"&::after": {
			position: "absolute",
            bottom: 0,
			content: "",
			width: "calc(100% - 90px)",
			height: 1,
			left: 80,
			backgroundColor: `${theme.accCol}`,
		},

		// "&::before": {
		// 	top: 0,
		// },
		// "&::after": {
		// 	bottom: 0,
		// },

		"& > div": {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",

			"& > p": {
				fontSize: "1.125rem",
			},
		},
	});
	return <StyledContact onClick={onClick}>{children}</StyledContact>;
}

export default Contact;
