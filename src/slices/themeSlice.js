import { createSlice } from "@reduxjs/toolkit";
import { theme } from "../features/utils";

// const currTheme = JSON.parse(localStorage.getItem("mumble-theme"));

export const themeSlice = createSlice({
	name: "theme",
	initialState: theme,
    reducers: {
        setTheme: (state, action) => {
            // localStorage.setItem("mumble-theme", JSON.stringify(action.payload));
            // const primCol = action.payload.primCol;
            // const r = parseInt(primCol.substring(1, 3), 16);
            // const g = parseInt(primCol.substring(3, 5), 16);
            // const b = parseInt(primCol.substring(5, 7), 16);
            // // const contrast = (r * 299 + g * 587 + b * 114) / 1000;
            // const contrast = (r * 299 + g * 587 + b * 114) > 100; // If greater than 100, it's a light color
            return action.payload
        }
    },
    // extraReducers: (builder) => {
    //     builder.addCase(setAsyncTheme.fulfilled, (state, action) => {
    //         state = action.payload
    //     })
    // },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = state => state.theme;

export default themeSlice.reducer;