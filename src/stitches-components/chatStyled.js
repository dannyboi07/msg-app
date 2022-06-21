import { styled } from "@stitches/react";

const StyledMsgCtn = styled("div", {
	// flexGrow: "1",
	position: "relative",
	height: "100%",
	display: "flex",
	flexDirection: "column",
	padding: "0.25em 2em 1em",
	// justifyContent: "flex-end",
	overflowY: "auto",

	// "& > *:first-child": {
	//     marginBottom: "calc(100% - 30px)"
	// }
});

const StyledMsg = styled("div", {
	position: "relative",
	width: "fit-content",
	maxWidth: "70%",
	margin: "1.5px 0",
	padding: "0.5em 0.75em",
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-end",

	"& > p": {
		fontSize: "1rem",
		width: "fit-content",
		marginBottom: "0.25em",
	},
	"& > span": {
		fontSize: "0.825rem",
	},
	border: "1px solid black",
});

const StyledMsgFlare = styled("div", {
	position: "absolute",
    top: -1,
	width: 12.5,
	height: 15,
    backgroundColor: "Black",
});

const MsgFlareLeft = styled(StyledMsgFlare, {
    left: -12.5,
	clipPath: "polygon(100% 0, 0 0, 100% 100%)",
    borderRadius: "0.25em 0 0 0"
});

const MsgFlareRight = styled(StyledMsgFlare, {
    right: -12.5,
	clipPath: "polygon(100% 0, 0 0, 0 100%)",
    borderRadius: "0 0.25em 0 0"
});

const StyledMsgDate = styled("span", {
	border: "1px solid black",
	fontSize: "0.975rem",
	margin: "0.75em",
	padding: "0.25em 0.5em",
	borderRadius: "0.25em",
});

const StyledMsgInputCtn = styled("div", {
	//minHeight: 40,
	height: 45,
	// padding: "0.25em 0",
	border: "1px solid black",
	display: "flex",
	alignItems: "center",

	"& > textarea": {
		display: "block",
		fontSize: "1rem",
		width: "100%",
		// height: 30,
		// minHeight: 20,
		height: "65%",
		// whiteSpace: "normal",
		// paddingTop: "3px",
		// padding: "0.5em 0.75em 0.75em 0.75em",
		overflow: "hidden",
		resize: "none",
		border: 0,
		overflowY: "auto",

		"&:focus": {
			outline: "none",
		},
	},

	"& > button": {
		fontSize: "0.95rem",
		padding: "0.25em 0.5em",
	},
});

const StyledChatProfile = styled("div", {
	height: 80,
	border: "1px solid black",
	display: "flex",
	alignItems: "center",
});

export {
	StyledMsgCtn,
	StyledMsg,
	StyledMsgDate,
	StyledMsgInputCtn,
	StyledChatProfile,
	MsgFlareLeft,
	MsgFlareRight,
};
