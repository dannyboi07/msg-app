import { styled } from "@stitches/react";

const StyledHome = styled("div", {
	width: "100%",
	minHeight: "100vh",
	display: "flex",
	border: "1px solid red",
});

const StyledContactList = styled("div", {
	width: "35%",

	"& > div:first-child": {
		padding: "1em",
        display: "flex",
        alignItems: "center"
	},
});

const StyledContact = styled("div", {
    position: "relative",
	width: "100%",
	height: "4.5em",
	display: "flex",
	alignItems: "center",
    "&:hover": {
        cursor: "pointer"
    },

    "&::before, &::after": {
        position: "absolute",
        content: "",
        width: "calc(100% - 90px)",
        height: 1,
        left: 80,
        backgroundColor: "Black"
    },

    "&::before": {
        top: 0,
    },
    "&::after": {
        bottom: 0
    },

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

const StyledChat = styled("div", {
	// width: "65%",
    flexGrow: 1,
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

export { StyledContactList, StyledContact, StyledChat, StyledHome };
