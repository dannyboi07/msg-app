import { createSlice } from "@reduxjs/toolkit";

/* State map
{   
    activeContactId: (userId)
    contacts: [
        {
            userId:
            name: 
            profile_pic: (url),
            message: {
                text: ,
                count: 
            }
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
		updatePendingMsgs: (state, action) => {
			let indexOf = -1;
			for (let i = 0; i < state.contacts.length; i++) {
				if (state.contacts[i].user_id === action.payload.contactId) {
					indexOf = i;
					break;
				}
			}
			if (indexOf === -1) return state;

			const contactMoveFront = {
				...state.contacts[indexOf],
				message: {
					text: action.payload.text,
					count: state.contacts[indexOf].message.count + 1,
				},
			};
			return {
				...state,
				contacts: [
					contactMoveFront,
					...state.contacts.filter(
						(contactObj) =>
							contactObj.user_id !== action.payload.contactId,
					),
				],
			};
		},
		clearPendingMsgs: (state, action) => {
			return {
				...state,
				contacts: state.contacts.map((contactObj) =>
					contactObj.user_id === action.payload
						? {
								...contactObj,
								message: {
									text: "",
									count: 0,
								},
						  }
						: contactObj,
				),
			};
		},
		eraseContactsState: () => {
			return {
				activeContactId: null,
				contacts: [],
			};
		},
	},
});

export const {
	addContact,
	setActiveContact,
	updatePendingMsgs,
	clearPendingMsgs,
    eraseContactsState
} = contactsSlice.actions;

export const selectContacts = (state) => state.contacts.contacts;
export const selectActiveContact = (state) => state.contacts.activeContactId;
export const selectActiveContactDetails = (state) =>
	state.contacts.contacts.find(
		(contact) => contact.user_id === state.contacts.activeContactId,
	);
export const selectPendingMsgs = (contactId) => (state) => {
	for (let i = 0; i < state.contacts.contacts.length; i++) {
		if (state.contacts.contacts[i].user_id === contactId) {
			return state.contacts.contacts[i].message;
		}
	}
	return null;
};

export default contactsSlice.reducer;

// let indexOf = -1;
// 			for (let i = 0; i < state.contacts.length; i++) {
// 				if (state.contacts[i].user_id === action.payload.contactId) {
// 					indexOf = i;
// 					break;
// 				}
// 			}
// 			if (indexOf === -1) return state;

// 			const contactMoveFront = state.contacts[indexOf];
// 			const contactMoveBack = state.contacts[0];

// 			return {
// 				...state,
// 				contacts: state.contacts.map((contactObj, i) => {
// 					if (i === 0) {
// 						return {
// 							...contactMoveFront,
// 							message: {
// 								text: action.payload.text,
// 								pendingCount:
// 									contactMoveFront.message.pendingCount + 1,
// 							},
// 						};
// 					} else if (i === indexOf) return contactObj;
// 				}),
// 			};
