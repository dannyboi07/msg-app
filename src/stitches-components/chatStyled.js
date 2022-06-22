import { keyframes, styled } from "@stitches/react";

const StyledMsgCtn = styled("div", {
	// flexShrink: 3,
	flexGrow: "1",
	minWidth: 0,
	// maxHeight: "100%",
	// height: "100%",
	display: "flex",
	alignItems: "flex-end",
	overflow: "auto",
	// flexDirection: "column",
	// justifyContent: "flex-end",

	"& > div.viewport-ctn": {
		minWidth: "100%",
		height: "fit-content",
		maxHeight: "100%",
		padding: "0.25em 2em 1em",
		display: "flex",
		flexDirection: "column",
		overflow: "auto",
		// border: "1px solid blue",
	},
	// "& > *:first-child": {
	//     marginBottom: "calc(100% - 30px)"
	// }
});

// const StyledMsgCtn = styled("div", {

// })

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
	// border: "1px solid black",
});

const animLoadBg = keyframes({
	"100%": {
		transform: "translateX(100%)",
	},
	// "0%": {
	//     backgroundPosition: "left"
	// },
	// "100%": {
	//     backgroundPosition: "right"
	// },
	// "100%": {
	//     backgroundPosition: "left"
	// }
});

// const StyledLoadingBg = styled("div", {
//     height: "100%",
//     background: "linear-gradient(to right, gray, lightgray)",
//     backgroundSize: "100% 100%",
//     animation: `${animLoadBg} 3s infinite alternate`,
// })

const StyledLoadingMsg = styled("div", {
	position: "relative",
	width: "70%",
	height: 150,
	margin: "0.5em 0",
	padding: "0.75em 1em",
	display: "flex",
	flexDirection: "column",
    justifyContent: "space-around",
	// border: "1px solid black",

	"& > div:not(:last-child)": {
		margin: "4px 0",
		width: "100%",
		height: 20,
		borderRadius: 2.5,
		overflow: "hidden",

		"&> div": {
			width: "100%",
			height: "100%",
			position: "relative",
			backgroundColor: "#DDDBDD",
			overflow: "hidden",

			"&::after": {
				position: "absolute",
				content: "",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				transform: "translateX(-100%)",
				background:
					// "linear-gradient(135deg, rgba(255,255,255, 0) 0, rgba(255,255,255, 0) 20%, rgba(255,255,255, 0.7) 60%, rgba(255,255,255, 0))",
					"linear-gradient(90deg, rgba(255,255,255, 0) 0, rgba(255,255,255, 0.2) 20%, rgba(255,255,255, 0.5) 60%, rgba(255,255,255, 0))",
				animation: `${animLoadBg} 3s infinite`,
			},
		},
	},

    "& > div:nth-child(4)": {
        width: 50,
    }
});

const StyledMsgFlare = styled("div", {
	position: "absolute",
	top: 0,
	width: 12.5,
	height: 15,
	backgroundColor: "Black",
});

const MsgFlareLeft = styled(StyledMsgFlare, {
	left: -12.5,
	clipPath: "polygon(100% 0, 0 0, 100% 100%)",
	borderRadius: "0.25em 0 0 0",
});

const MsgFlareRight = styled(StyledMsgFlare, {
	right: -12.5,
	clipPath: "polygon(100% 0, 0 0, 0 100%)",
	borderRadius: "0 0.25em 0 0",
});

const StyledMsgDate = styled("span", {
	// border: "1px solid black",
	fontSize: "0.975rem",
	margin: "0.75em",
	padding: "0.35em 0.65em",
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
	minHeight: 70,
	// border: "1px solid black",
	display: "flex",
	alignItems: "center",
});

export {
	StyledMsgCtn,
	StyledMsg,
	StyledLoadingMsg,
	// StyledLoadingBg,
	StyledMsgDate,
	StyledMsgInputCtn,
	StyledChatProfile,
	MsgFlareLeft,
	MsgFlareRight,
};
