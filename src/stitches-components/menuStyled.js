import { styled } from "@stitches/react";
import { blackA } from "@radix-ui/colors";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export const StyledRadio = styled(RadioGroupPrimitive.Item, {
	all: "unset",
	// bgColor,
	width: 25,
	height: 25,
	borderRadius: "100%",
	boxShadow: `0 2px 10px ${blackA.blackA8}`,

	"&:hover": {
		backgroundColor: blackA.blackA8,
	},

	"&:focus": {
		boxShadow: `0 0 0 2px black`,
	},
});

export const StyledIndicator = styled(RadioGroupPrimitive.Indicator, {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "100%",
	height: "100%",
	position: "relative",

	"&::after": {
		content: "''",
		display: "block",
		width: 11,
		height: 11,
		borderRadius: "50%",
		// bgCol
	},
});

export const Box = styled("div", {});

export const RadioGroup = RadioGroupPrimitive.Root;
// export const RadioGroupRadio = StyledRadio;
// export const RadioGroupIndicator = StyledIndicator;

const StyledTabs = styled(TabsPrimitive.Root, {
	display: "flex",
	flexDirection: "column",
	width: 300,
	// boxShadow: `0 2px 10px ${blackA.blackA4}`,
});

const StyledList = styled(TabsPrimitive.List, {
	flexShrink: 0,
	display: "flex",
	// borderBottom: `1px solid ${blackA.blackA9}`,
});

const StyledTrigger = styled(TabsPrimitive.Trigger, {
	all: "unset",
	fontFamily: "inherit",
	//backgroundColor
	padding: "0 20px",
	height: 45,
	flex: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: 15,
	lineHeight: 1,
	//color
	userSelect: "none",
	"&:first-child": {
		borderTopLeftRadius: 6,
	},
	"&:last-child": {
		borderTopRightRadius: 6,
	},
	// hover color
	// data-state='active'
	// focus
});

const StyledContent = styled(TabsPrimitive.Content, {
	flex: 1,
	padding: 20,
	// backgroundColor
	borderBottomLeftRadius: 6,
	borderBottomRightRadius: 6,
	outline: "none",
	// "&:focus": {
	//     boxShadow: "0 0 0 2px black"
	// }

	// "&:[data-value='tab1']": {
	//     display: "flex",
	// }
});

export { StyledTabs, StyledList, StyledTrigger, StyledContent };
