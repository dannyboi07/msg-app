import { styled } from "@stitches/react";
import { StyledForm } from "./commonStyled";
import { blackA } from "@radix-ui/colors";

const StyledLoginBg = styled("div", {
	width: "100%",
	height: "100vh",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	flexDirection: "column",

	"& > h1": {
		marginBottom: "0.5em",
	},
});

const StyledLoginForm = styled(StyledForm, {
	width: 300,
	height: 400,
	display: "flex",
	flexDirection: "column",
	justifyContent: "space-evenly",

    "& > label > input": {
		marginTop: "0.25em",
		padding: "0.25em 0.65em",
		height: "2.35em",
		borderRadius: "0.25em",

		'&:not([type="file"])': {
			border: 0,
			backgroundColor: blackA.blackA3,
			boxShadow: `0 0 0 1px ${blackA.blackA9}`,
			transition: "box-shadow 0.15s",

			"&:hover, &:focus": {
				boxShadow: "0 0 0 2px black",
			},
		},
	},

	"& > button": {
		width: "fit-content",
		alignSelf: "center",
		fontFamily: "Helvetica Neue, sans-serif",
	},
});

export {
    StyledLoginBg as LoginBg,
    StyledLoginForm as LoginForm
}
