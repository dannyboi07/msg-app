import { styled, keyframes } from "@stitches/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { violet, mauve, blackA, grass } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const StyledHome = styled("div", {
	width: "100%",
	minHeight: "100vh",
	display: "flex",
});

const StyledContactList = styled("div", {
	width: "35%",
    maxWidth: 350,

	"& > div:first-child": {
		padding: "1em 1.75em",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",

		"& > img": {
			height: 17.5,

			"&:hover": {
				cursor: "pointer",
			},
		},
	},
});

const StyledContact = styled("div", {
	position: "relative",
	width: "100%",
	height: "4.5em",
	display: "flex",
	alignItems: "center",
	transition: "backdrop-filter 0.15s",

	"&::after": {
		position: "absolute",
		bottom: 0,
		content: "",
		width: "calc(100% - 90px)",
		height: 1,
		left: 80,
	},

	"& > div": {
		height: 55,
		flexGrow: 1,
		marginRight: 10,
		// border: "1px solid black",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",

		"& > div": {
			"&:first-child": {
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-evenly",

				"& > p": {
					"&:first-child": {
						fontSize: "1.125rem",
					},

                    "&.pndng-msg": {
                        maxWidth: 200,
                        maxHeight: 20,
                        overflow: "hidden"
                    }
				},
			},

			"&.pndng-count": {
				marginRight: "0.5em",
				padding: "0.25em 0.5em",
				borderRadius: "100%",
				color: "white",
				backgroundColor: grass.grass8,
			},
		},
	},
});

const StyledChat = styled("div", {
	// width: "65%",
	flexGrow: 1,
	minHeight: "100%",
	maxHeight: "100vh",
	// border: "1px solid black",
	display: "flex",
	flexDirection: "column",

	// "& > div": {
	//     flexGrow: 1,
	//     overflow: "auto"
	// }
});

const slideUpAndFade = keyframes({
	"0%": {
		opacity: 0,
		// transform: "translateY(2px)",
		transform: "scale(0)",
	},
	"100%": {
		opacity: 1,
		// transform: "translateY(0px)",
		transform: "scale(1)",
	},
});

const slideDownAndFade = keyframes({
	"0%": {
		opacity: 0,
		//transform: "translateY(-2px)",
		transform: "scale(0)",
	},
	"100%": {
		opacity: 1,
		//transform: "translateY(0px)",
		transform: "scale(1)",
	},
});

const StyledContent = styled(DropdownMenuPrimitive.Content, {
	minWidth: 220,
	backgroundColor: "white",
	borderRadius: 6,
	padding: 5,
	boxShadow:
		"0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
	"@media (prefers-reduced-motion: no-preference)": {
		animationDuration: "400ms",
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		willChange: "transform, opacity",
		'&[data-state="open"]': {
			'&[data-side="top"]': { animationName: slideUpAndFade },
			'&[data-side="bottom"]': { animationName: slideDownAndFade },
		},
	},
	transformOrigin: "100% -25%",
});

const itemStyles = {
	all: "unset",
	fontSize: "0.975rem",
	lineHeight: 1,
	// color: violet.violet11,
	borderRadius: "0.25em",
	display: "flex",
	alignItems: "center",
	height: 30,
	padding: "0 5px",
	position: "relative",
	paddingLeft: 15,
	userSelect: "none",
	transition: "background-color 0.15s ease-in-out, color 0.15s ease-in-out",

	"&[data-disabled]": {
		color: mauve.mauve8,
		pointerEvents: "none",
	},

	// "&:focus": {
	// 	backgroundColor: violet.violet9,
	// 	color: violet.violet1,
	// },

	"& > img, & > svg": {
		marginRight: 15,
	},
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });
const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, {
	...itemStyles,
});
const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem, {
	...itemStyles,
});
const StyledTriggerItem = styled(DropdownMenuPrimitive.TriggerItem, {
	'&[data-state="open"]': {
		backgroundColor: violet.violet4,
		color: violet.violet11,
	},
	...itemStyles,
});

const StyledLabel = styled(DropdownMenuPrimitive.Label, {
	paddingLeft: 25,
	fontSize: 12,
	lineHeight: "25px",
	color: mauve.mauve11,
});

const StyledSeparator = styled(DropdownMenuPrimitive.Separator, {
	height: 1,
	// backgroundColor: violet.violet6,
	margin: 5,
});

const StyledItemIndicator = styled(DropdownMenuPrimitive.ItemIndicator, {
	position: "absolute",
	left: 0,
	width: 25,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
	fill: "white",
});

export { StyledContactList, StyledContact, StyledChat, StyledHome, StyledItem };

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger, {
	"&:hover": {
		cursor: "pointer",
	},
});
export const DropdownMenuContent = StyledContent;
export const DropdownMenuItem = StyledItem;
// export const DropdownMenuCheckboxItem = StyledCheckboxItem;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = StyledRadioItem;
export const DropdownMenuItemIndicator = StyledItemIndicator;
export const DropdownMenuTriggerItem = StyledTriggerItem;
export const DropdownMenuLabel = StyledLabel;
export const DropdownMenuSeparator = StyledSeparator;
export const DropdownMenuArrow = StyledArrow;

const overlayShow = keyframes({
	"0%": {
		opacity: 0,
	},
	"100%": {
		opacity: 1,
	},
});

const contentShow = keyframes({
	"0%": {
		opacity: 0,
		transform: "translate(-50%, -48%) scale(.96)",
	},
	"100%": {
		opacity: 1,
		transform: "translate(-50%, -50%) scale(1)",
	},
});

const StyledDialogOverlay = styled(DialogPrimitive.Overlay, {
	backgroundColor: blackA.blackA9,
	position: "fixed",
	inset: 0,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

const StyledDialogContent = styled(DialogPrimitive.Content, {
	// backgroundColor: "white",
	borderRadius: 6,
	boxShadow:
		"hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
	position: "fixed",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90vw",
	maxWidth: "600px",
	maxHeight: "87.5vh",
	padding: 25,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
	"&:focus": {
		outline: "none",
	},
});

const StyledDialogTitle = styled(DialogPrimitive.Title, {
	margin: 0,
	fontWeight: 500,
	fontSize: "1.25rem",
});

const StyledDialogDescription = styled(DialogPrimitive.Description, {
	margin: "10px 0 20px",
	fontSize: 15,
	lineHeight: 1.5,
});

const StyledDialogClose = styled(DialogPrimitive.Close, {
	all: "unset",
	position: "absolute",
	top: 15,
	right: 15,
	width: 30,
	height: 30,
	borderRadius: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",

	"&:hover": {
		backgroundColor: blackA.blackA7,
	},
	"&:focus": {
		boxShadow: `0 0 0 2px ${blackA.blackA7}`,
	},
});

export {
	StyledDialogOverlay,
	StyledDialogContent,
	StyledDialogTitle,
	StyledDialogDescription,
	StyledDialogClose,
};
export const StyledDialog = DialogPrimitive.Root;
export const StyledDialogTrigger = DialogPrimitive.Trigger;
export const StyledDialogPortal = DialogPrimitive.Portal;
