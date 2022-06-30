import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { Box } from "../../stitches-components/menuStyled";
import { styled } from "@stitches/react";
import {
	RadioGroup,
	StyledRadio,
	StyledIndicator,
	Box,
} from "../../stitches-components/menuStyled";
import { lightTheme, darkTheme, calcContrast } from "../../features/utils";
// import { setTheme } from "../../slices/themeSlice";
import { setTheme } from "../../slices/themeSlice";
// import { greenA } from "@radix-ui/colors";

function ThemeSettings() {
	const dispatch = useDispatch();
	const theme = useSelector((state) => state.theme);
	const [themeOption, setThemeOption] = useState(theme.type);
	const [customTheme, setCustomTheme] = useState({
		type: "custom",
		primCol: theme.primCol,
		secCol: theme.secCol,
		accCol: theme.accCol,
	});

	useEffect(() => {
		if (themeOption === "light") {
			window.localStorage.setItem(
				"mumble-theme",
				JSON.stringify(lightTheme),
			);
			dispatch(setTheme(lightTheme));
			setCustomTheme({ ...lightTheme, type: "custom" });
		} else if (themeOption === "dark") {
			window.localStorage.setItem(
				"mumble-theme",
				JSON.stringify(darkTheme),
			);
			dispatch(setTheme(darkTheme));
			setCustomTheme({ ...darkTheme, type: "custom" });
		}
		// else if (themeOption === "custom") {
		// 	window.localStorage.setItem(
		// 		"mumble-theme",
		// 		JSON.stringify(customTheme),
		// 	);
		// 	dispatch(setTheme(customTheme));
		// }
	}, [themeOption]);

	const RadioGroupIndicator = styled(StyledIndicator, {
		"&::after": {
			backgroundColor: theme.accCol,
		},
	});

	const customThemeStyle = {
		marginTop: "0.75em",
		display: "flex",
		flexDirection: "column",
		padding: "0 0.5em",

		"& > h5": {
			marginBottom: "0.5em",
		},
		"& > label": {
			display: "flex",
			justifyContent: "space-between",
		},

		"& > button": {
			fontSize: "1rem",
			marginTop: "0.5em",
			padding: "0.5em 1em",
			color: theme.contrast ? "white" : "black",
			backgroundColor: theme.accCol,
			border: "none",
			borderRadius: "0.25rem",
			transition: "background-color 0.2s ease-in-out",
			fontWeight: 500,

			"&:hover": {
				cursor: "pointer",
				// backgroundColor: ,
			},
		},
	};

	function handleCustomThemeChange(e) {
		setCustomTheme({
			...customTheme,
			[e.target.name]: e.target.value,
		});
		if (e.target.name === "submit-custom") {
			window.localStorage.setItem(
				"mumble-theme",
				JSON.stringify(customTheme),
			);
			dispatch(
				setTheme({
					...customTheme,
					contrast: calcContrast(customTheme.primCol),
				}),
			);
		}
	}

	return (
		<Box
			css={{
				width: "40%",
				// border: "1px solid black",
			}}
		>
			<RadioGroup
				defaultValue={themeOption}
				aria-label="Choose your theme"
				onValueChange={(value) => setThemeOption(value)}
			>
				<Box
					css={{
						display: "flex",
						alignItems: "center",
						// justifyContent:
						// 	"space-between",
						// border: "1px solid black",
					}}
				>
					<StyledRadio
						css={{
							marginRight: "0.75em",
							border: `1px solid ${theme.accCol}`,
						}}
						value="light"
						id="r1"
					>
						<RadioGroupIndicator />
					</StyledRadio>
					<label htmlFor="r1">Light</label>
				</Box>

				<Box
					css={{
						display: "flex",
						alignItems: "center",
						// justifyContent:
						// 	"space-between",
						margin: "0.5em 0",
					}}
				>
					<StyledRadio
						css={{
							marginRight: "0.75em",
							border: `1px solid ${theme.accCol}`,
						}}
						value="dark"
						id="r2"
					>
						<RadioGroupIndicator />
					</StyledRadio>
					<label htmlFor="r2">Dark</label>
				</Box>

				<Box
					css={{
						display: "flex",
						alignItems: "center",
						// justifyContent:
						// 	"space-between",
					}}
				>
					<StyledRadio
						css={{
							marginRight: "0.75em",
							border: `1px solid ${theme.accCol}`,
						}}
						value="custom"
						id="r3"
					>
						<RadioGroupIndicator />
					</StyledRadio>
					<label htmlFor="r3">Custom</label>
				</Box>
			</RadioGroup>

			{themeOption === "custom" && (
				<Box css={customThemeStyle}>
					<h5>Font color will be contrasted to your primary color</h5>
					<label>
						Primary Color:
						<input
							id="primCol"
							type="color"
							name="primCol"
							value={customTheme.primCol}
							onChange={(e) => handleCustomThemeChange(e)}
						/>
					</label>
					<label>
						Secondary Color:
						<input
							id="secCol"
							type="color"
							name="secCol"
							value={customTheme.secCol}
							onChange={(e) => handleCustomThemeChange(e)}
						/>
					</label>
					<label htmlFor="accCol">
						Accent Color:
						<input
							id="accCol"
							type="color"
							name="accCol"
							value={customTheme.accCol}
							onChange={(e) => handleCustomThemeChange(e)}
						/>
					</label>
					<button
						name="submit-custom"
						onClick={handleCustomThemeChange}
						style={{
							alignSelf: "center",
						}}
					>
						Change
					</button>
				</Box>
			)}
		</Box>
	);
}

export default ThemeSettings;
