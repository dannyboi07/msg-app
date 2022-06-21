import { styled } from "@stitches/react";

const StyledHome = styled("div", {
	width: "100%",
	minHeight: "100vh",
	display: "flex",
	border: "1px solid red",
});

const StyledContact = styled("div", {
	width: "100%",
	height: "4.5em",
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

const StyledChat = styled("div", {
	width: "70%",
	minHeight: "100%",
    maxHeight: "100vh",
	border: "1px solid black",
    display: "flex",
    flexDirection: "column",

    // "& > div": {
    //     flexGrow: 1,
    //     overflow: "auto"
    // }
});

export { StyledContact as Contact, StyledChat, StyledHome };
