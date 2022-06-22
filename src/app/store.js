import { configureStore } from "@reduxjs/toolkit";
// import counterReducer from "../features/counter/counterSlice";
import userReducer from "../slices/userSlice";
import contactsReducer from "../slices/contactsSlice";
import chatReducer from "../slices/chatSlice";
import toastReducer from "../slices/toastSlice";
import themeReducer from "../slices/themeSlice";
// import { api } from "../api/apiSlice";

// const userDetails = JSON.parse(localStorage.getItem("msg-app-user-details"));

// const preloadedState = {
//     toast: {
//         type: "info",
//         message: null
//     },
//     user: userDetails ? userDetails : null
// }

export const store = configureStore({
	reducer: {
		// counter: counterReducer,
        toast: toastReducer,
        user: userReducer,
        contacts: contactsReducer,
        chats: chatReducer,
        theme: themeReducer,
		// [api.reducerPath]: api.reducer,
	},
    // preloadedState,
	// middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
