import { createSlice } from "@reduxjs/toolkit";
import { theme } from "../features/utils";

// const currTheme = JSON.parse(localStorage.getItem("mumble-theme"));

export const themeSlice = createSlice({
	name: "theme",
	initialState: theme,
    reducers: {
        setTheme: (state, action) => {
            // localStorage.setItem("mumble-theme", JSON.stringify(action.payload));
            return action.payload;
        }
    },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = state => state.theme;

export default themeSlice.reducer;