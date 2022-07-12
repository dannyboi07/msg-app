import { styled, keyframes } from "@stitches/react";
import { blackA, muave, slate, grassA, blueA, redA, yellowA } from "@radix-ui/colors";
import * as ToastPrimitive from "@radix-ui/react-toast";

const VIEWPORT_PADDING = 25;

const hide = keyframes({
	"0%": { opacity: 1 },
	"100%": { opacity: 0 },
});

const slideIn = keyframes({
	from: { transform: `translateX(calc(100% + ${VIEWPORT_PADDING}px))` },
	to: { transform: "translateX(0)" },
});

const swipeOut = keyframes({
	from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
	to: { transform: `translateX(calc(100% + ${VIEWPORT_PADDING}px))` },
});

const StyledViewport = styled(ToastPrimitive.Viewport, {
	position: "fixed",
	bottom: 0,
	right: 0,
	display: "flex",
	flexDirection: "column",
	padding: VIEWPORT_PADDING,
	gap: 10,
	width: 380,
	maxWidth: "100vw",
	margin: 0,
	listStyle: "none",
	zIndex: 999,
	outline: "none",
});

const StyledToast = styled(ToastPrimitive.Root, {
    backgroundColor: "white",
	borderRadius: 6,
	boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
	display: "flex",
	//border: "1px solid black",
	// gridTemplateAreas: '"graphic-holder title" "graphic-holder description"',
	// padding: 15,
	// gridTemplateColumns: "max-content auto",
	// columnGap: 12,
	// rowGap: 5,
	// alignItems: "stretch",

	"@media (prefers-reduced-motion: no-preference)": {
		'&[data-state="open"]': {
			animation: `${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
		},
		'&[data-state="closed"]': {
			animation: `${hide} 100ms ease-in forwards`,
		},
		'&[data-swipe="move"]': {
			transform: "translateX(var(--radix-toast-swipe-move-x))",
		},
		'&[data-swipe="cancel"]': {
			transform: "translateX(0)",
			transition: "transform 200ms ease-out",
		},
		'&[data-swipe="end"]': {
			animation: `${swipeOut} 100ms ease-out forwards`,
		},
	},

	// "& > *": {
	// 	border: "1px solid red",
	// },

	"& > div.graphic-ctn": {
		// gridArea: "graphic-ctn",
		// height: "100%",
		// width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: "0 21px 0 17px",

		"&.suc": {
			backgroundColor: grassA.grassA9,
		},

		"&.err": {
			backgroundColor: redA.redA9,
		},

		"&.info": {
			backgroundColor: blueA.blueA8,
		},

        "&.warn": {
            backgroundColor: yellowA.yellowA10
        }
	},

	"& > div.text-ctn": {
		padding: "0.925em",
	},

	"&.suc": {
		border: `5px solid ${grassA.grassA9}`,
	},

	"&.info": {
		border: `5px solid ${blueA.blueA8}`,
	},

	"&.err": {
		border: `5px solid ${redA.redA9}`,
	},

    "&.warn": {
        border: `5px solid ${yellowA.yellowA10}`
    }
});

const StyledTitle = styled(ToastPrimitive.Title, {
	// gridArea: "title",
	// marginBottom: "0em",
	fontWeight: 500,
	// margin: "12px 12px 0px 0",
	// color: slate.slate12,
	fontSize: "1rem",
});

const StyledDescription = styled(ToastPrimitive.Description, {
	// gridArea: "description",
	// margin: "0 12px 12px 0",
	// color: slate.slate11,
	marginTop: "0.30em",
	fontSize: "0.925rem",
	lineHeight: 1.3,
});

const StyledAction = styled(ToastPrimitive.Action, {
	// gridArea: "action",
    fontSize: "0.85rem",
    height: "fit-content",
    padding: "0.4em 0.75em",
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "1em",
    border: 0,
    borderRadius: 6,

    "&:hover": {
        cursor: "pointer"
    }
});

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = StyledViewport;
export const Toast = StyledToast;
export const ToastTitle = StyledTitle;
export const ToastDescription = StyledDescription;
export const ToastAction = StyledAction;
export const ToastClose = ToastPrimitive.Close;

export { StyledToast };

// , StyledViewport, StyledTitle, StyledDescription, StyledAction
