import { createSlice } from "@reduxjs/toolkit";

export const refreshSlice = createSlice({
	name: "refresh",
	initialState: null,
	reducers: {
		setRefreshTrue: () => {
			return true;
		},
        setRefreshHold: () => {
            return "hold";
        },
		setRefreshFalse: () => {
			return false;
		},
	},
});

export const { setRefreshTrue, setRefreshHold, setRefreshFalse } = refreshSlice.actions;

export const selectRefresh = (state) => {
	return state.refresh;
};

export default refreshSlice.reducer;