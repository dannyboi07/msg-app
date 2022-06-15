import { styled } from "@stitches/react";

const StyledContact = styled("div", {
	width: "100%",
	height: "5em",
	display: "flex",
    alignItems: "center",
    border: "1px solid black",  

	"& > div": {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
});

export { StyledContact as Contact };
