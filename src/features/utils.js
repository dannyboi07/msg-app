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

const cacheTheme = JSON.parse(localStorage.getItem("mumble-theme"));
export const theme = cacheTheme // Check if theme is set in localStorage
	? cacheTheme.type === "custom" // Check if theme is custom
		? cacheTheme.theme
		: cacheTheme.type === "light" // Check if theme is light
		? { primCol: "#faf9f9", secCol: "#c9e4ca", accCol: "#55828b" }
		: { primCol: "#0b3954", secCol: "#087e8b", accCol: "#bfd7ea" } // Or return dark theme
	: { primCol: "#0b3954", secCol: "#087e8b", accCol: "#bfd7ea" }; // Set default theme

// { primCol: "#c9e4ca", secCol: "#87bba2", accCol: "#55828b" }
