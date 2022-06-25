export function parseInitials(name) {
	const splitName = name.split(" ");
	let nameInitials = "";
	const limit = splitName.length > 2 ? 2 : splitName.length;
	for (let i = 0; i < limit; i++) {
		// if (i === 2) {
		//     break;
		// }
		// console.log(splitName, splitName[i], splitName.length, limit, i);
		nameInitials += splitName[i][0];
	}
	return nameInitials;
}

function luminance(r, g, b) {
	const a = [r, g, b].map((v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
	const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	const brightest = Math.max(lum1, lum2);
	const darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}

export function calcContrast(col) {
	// const primCol = action.payload.primCol;
	const r = parseInt(col.substring(1, 3), 16);
	const g = parseInt(col.substring(3, 5), 16);
	const b = parseInt(col.substring(5, 7), 16);
	const contrast = r * 0.299 + g * 0.587 + b * 0.114;
	console.log(contrast); // /1000 > 100
	return contrast > 100; // If greater than 100, it's a light color and needs a dark text color
}

export const lightTheme = {
	type: "light",
	primCol: "#faf9f9",
	secCol: "#c9e4ca",
	accCol: "#55828b",
	contrast: calcContrast("#faf9f9"),
};

export const darkTheme = {
	type: "dark",
	primCol: "#0b3954",
	secCol: "#087e8b",
	accCol: "#bfd7ea",
	contrast: calcContrast("#0b3954"),
};

const cacheTheme = JSON.parse(localStorage.getItem("mumble-theme"));
export const theme = cacheTheme // Check if theme is set in localStorage
	? cacheTheme.type === "custom" // Check if theme is custom
		? {
				...cacheTheme.theme,
				contrast: calcContrast(cacheTheme.theme.accCol),
		  }
		: cacheTheme.type === "light" // Check if theme is light
		? lightTheme
		: darkTheme // Or return dark theme
	: darkTheme; // Set default theme

// { primCol: "#c9e4ca", secCol: "#87bba2", accCol: "#55828b" }
