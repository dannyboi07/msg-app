import { blackA } from "@radix-ui/colors";
import { keyframes, styled } from "@stitches/react";

const StyledMsgCtn = styled("div", {
	// flexShrink: 3,
	position: "relative",
	flexGrow: "1",
	minWidth: 0,
	// maxHeight: "100%",
	// height: "100%",
	display: "flex",
	alignItems: "flex-end",
	overflow: "auto",
	// flexDirection: "column",
	// justifyContent: "flex-end",
	boxShadow: "inset -10px -10px 70px -25px rgba(0,0,0,0.75)",

	"& > div.viewport-ctn": {
		position: "relative",
		minWidth: "100%",
		height: "fit-content",
		maxHeight: "100%",
		padding: "0.25em 2em 1em",
		display: "flex",
		flexDirection: "column",
		overflow: "auto",

		"& > div:not(:last-child)": {
			boxShadow: "0 1px 0 1px rgba(0,0,0,0.1)",

			// "& > div": {
			//     boxShadow: "0 1px 0 1px rgba(0,0,0,0.1)",
			// }
		},
	},
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
});

const animLoadBg = keyframes({
	"100%": {
		transform: "translateX(100%)",
	},
});

const StyledLoadingMsg = styled("div", {
	position: "relative",
	width: "70%",
	height: 150,
	margin: "0.5em 0",
	padding: "0.75em 1em",
	display: "flex",
	flexDirection: "column",
	justifyContent: "space-around",

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
	},
});

const StyledMsgFlare = styled("div", {
	position: "absolute",
	top: 0,
	width: 12.5,
	height: 15,
	backgroundColor: "Black",
});

const MsgFlareLeft = styled(StyledMsgFlare, {
	left: -12,
	clipPath: "polygon(100% 0, 0 0, 100% 100%)",
	borderRadius: "0.25em 0 0 0",
});

const MsgFlareRight = styled(StyledMsgFlare, {
	right: -12.5,
	clipPath: "polygon(100% 0, 0 0, 0 100%)",
	borderRadius: "0 0.25em 0 0",
});

const StyledMsgDate = styled("span", {
	fontSize: "0.975rem",
	margin: "0.75em",
	padding: "0.35em 0.65em",
	borderRadius: "0.25em",
});

const MsgInputCtn = styled("div", {
	display: "flex",
	backgroundColor: "transparent",
	alignItems: "center",
	// border: "1px solid red",
	padding: "0.85em 1em",

	"& > button": {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: "0.95rem",
		// padding: "0.25em 0.5em",
		width: 45,
		height: 42,
		borderRadius: 5,
		border: "none",
		backgroundColor: "white",
        // border: "1px solid black",
        transition: "backdrop-filter 0.25s",

		"&:not([disabled]):hover": {
			cursor: "pointer",
			backdropFilter: "contrast(70%)",
		},

		"& > svg": {
			width: "65%",
			height: "65%",
		},
	},
});

const StyledMsgInputCtn = styled("div", {
	//minHeight: 40,
	height: 45,
	flexGrow: 1,
	// padding: "0.25em 0",
	border: "1px solid black",
	display: "flex",
	alignItems: "center",
	// borderRadius: "1.5em",
	overflow: "hidden",
	// backgroundColor: "white",

	"& > textarea": {
		display: "block",
		fontSize: "1rem",
		// width: "92.5%",
		flexGrow: 1,
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
		border: "1px solid black",
		backgroundColor: "transparent",

		"&:focus": {
			outline: "none",
		},
	},

	"& > button": {
		fontSize: "0.95rem",
		padding: "0.25em 0.5em",
		width: 45,
		height: 45,

		"& > svg": {
			width: "75%",
			height: "75%",
		},
	},
});

const StyledMsgInput = styled("div", {
    position: "relative",
	flexGrow: 1,
	// border: "1px solid black",
    minHeight: 42,
	maxHeight: 150,
	overflow: "auto",
	padding: "0.75em 1em",
    marginRight: "1em",
    borderRadius: 5,

    "&:focus": {
        outline: "none"
    },

    "&.shw-plchldr::before": {
        position: "absolute",
        content: "Type a message...",
        color: blackA.blackA11,
        top: "0.75em",
        left: "1em",
        pointerEvents: "none"
    }
});

const StyledChatProfile = styled("div", {
	minHeight: 70,
	display: "flex",
	alignItems: "center",

	"& > div:last-child": {
		height: 45,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",

		"& > p": {
			"&:first-child": {
				fontSize: "1.125rem",
			},
			"&:last-child": {
				fontSize: "0.925rem",
			},
		},
	},
});

const StyledGoDown = styled("div", {
	position: "absolute",
	bottom: 15,
	right: 32,
	height: 40,
	width: 40,
	borderRadius: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	transform: "scale(0,0)",
	transition: "transform 0.25s",

	"&:hover": {
		cursor: "pointer",
		backdropFilter: "contrast(70%)",
	},

	"&.go-down-btn--show": {
		transform: "scale(1,1)",
	},
});

export {
	StyledMsgCtn,
	StyledMsg,
	StyledMsgInput,
	StyledLoadingMsg,
	StyledMsgDate,
	MsgInputCtn,
	StyledMsgInputCtn,
	StyledChatProfile,
	MsgFlareLeft,
	MsgFlareRight,
	StyledGoDown,
};
