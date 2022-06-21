import { createSlice } from "@reduxjs/toolkit";

// const clearToastTimeout = createAsyncThunk(
//     "toast/clear",
//     async
// )

export const toastSlice = createSlice({
	name: "toast",
	initialState: {
        type: "info",
        message: null
    },
	reducers: {
		setToast: (state, action) => {
            return action.payload
        },
		clearToast: () => {
			return {
				type: "info",
				message: null,
			};
		},
	},
});

export const { setToast, clearToast } = toastSlice.actions;

export const selectToast = (state) => state.toast;

export default toastSlice.reducer;
