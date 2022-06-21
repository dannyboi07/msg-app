import { createSlice } from "@reduxjs/toolkit";

const userDetails = JSON.parse(localStorage.getItem("msg-app-user-details"))

export const userSlice = createSlice({
    name: "user",
    initialState: userDetails,
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
export const selectUserId = (state) => state.user.user_id;

export default userSlice.reducer;