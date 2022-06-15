import { createSlice, } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: null,
    reducers: {
        setUser: (state, action) => {
            return action.payload
        },
        clearUser: () => {
            return null
        }
    },
})

export const { setUser, clearUser } = userSlice.actions;

export const selectUser = (state) => state.user;

export default userSlice.reducer;