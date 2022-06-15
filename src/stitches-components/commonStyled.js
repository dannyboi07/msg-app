import { styled } from "@stitches/react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { blackA } from "@radix-ui/colors";

const StyledForm = styled("form", {
	border: "1px solid black",
	padding: "2em 1.5em",
    borderRadius: "0.25em"
});

const StyledInput = styled("input", {
	fontSize: "1rem",
	width: "100%",
	display: "block",
});

const StyledButton = styled("button", {
	fontSize: "1rem",
	padding: "0.5em 1em",
});

const StyledAvatar = styled(AvatarPrimitive.Root, {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	verticalAlign: "middle",
	overflow: "hidden",
	userSelect: "none",
	width: 60,
	height: 60,
	borderRadius: "100%",
	backgroundColor: blackA.blackA3,
    border: "1px solid black"
});

const StyledImage = styled(AvatarPrimitive.Image, {
	width: "100%",
	height: "100%",
	objectFit: "cover",
	borderRadius: "inherit",
});

const StyledFallback = styled(AvatarPrimitive.Fallback, {
	width: "100%",
	height: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "white",
	color: blackA.blackA12,
	fontSize: "1.5rem",
	lineHeight: 1,
	fontWeight: 500,
    textTransform: "uppercase"
});

export {
	StyledForm,
	StyledInput,
	StyledButton,
	StyledAvatar as Avatar,
	StyledImage as AvatarImage,
    StyledFallback as AvatarFallback
};
