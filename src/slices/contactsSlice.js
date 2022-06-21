import { createSlice } from "@reduxjs/toolkit";

/* State map
{   
    activeContactId: (userId)
    contacts: [
        {
            userId:
            name: 
            profile_pic: (url)
        },
        ...
    ]
}
*/

export const contactsSlice = createSlice({
	name: "contacts",
	initialState: {
		activeContactId: null,
		contacts: [],
	},
	reducers: {
		addContact: (state, action) => {
			return {
				...state,
				contacts: [...state.contacts, ...action.payload],
			};
		},
		setActiveContact: (state, action) => {
			return {
				...state,
				activeContactId: action.payload,
			};
		},
	},
});

export const { addContact, setActiveContact } = contactsSlice.actions;
export const selectContacts = (state) => state.contacts.contacts;
export const selectActiveContact = (state) => state.contacts.activeContactId;
export const selectActiveContactDetails = (state) => state.contacts.contacts.find(contact => contact.user_id === state.contacts.activeContactId)

export default contactsSlice.reducer;
