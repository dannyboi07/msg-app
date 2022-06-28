import { createSlice } from "@reduxjs/toolkit";

/* 
Map of the state for this:
[
    {
        contactId: ,
        messages: [
            {
                from: ,
                to: ,
                message: text,
                time: ,
            }
        ],
        queryOffset: ,
        lastAcc: Latest time in seconds this a particular object such as this was touched by the user,
        // So be used while scanning this state to clear "cache" at regular intervals 
    }
]
*/

export const chatSlice = createSlice({
	name: "chats",
	initialState: [],
	reducers: {
		addMsg: (state, action) => {
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload.contactId
					? {
							contactId: chatsObj.contactId,
							messages: [
								...chatsObj.messages,
								action.payload.message,
							],
							queryOffset: chatsObj.queryOffset,
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
			// return  state.allMessages.map((chatsObj) =>
			// 		chatsObj.contactId === action.payload.contactId
			// 			? {
			// 					contactId: chatsObj.contactId,
			// 					messages: [
			// 						...chatsObj.messages, // [{msg1}, {msg2}], destruct will {msg1}, {msg2}
			// 						action.payload,
			// 					],
			// 					lastAcc: Date.now(),
			// 			  }
			// 			: chatsObj,
			// 	),
		},
		addMsgs: (state, action) => {
			const reversedMsgs = action.payload.messages.reverse();
			// console.log(reversedMsgs);
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload.contactId
					? {
							contactId: chatsObj.contactId,
							messages: [...reversedMsgs, ...chatsObj.messages],
							queryOffset: chatsObj.queryOffset,
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
			// return state.map((chatsObj) => {
			// 	console.log(chatsObj);
			// 	if (chatsObj.contactId === action.payload.contactId) {
			// 		for (let i = 0; i < action.payload.messages.length; i++) {
			// 			chatsObj.messages.unshift(action.payload.messages[i]);
			// 		}
			// 		return chatsObj;
			// 	} else return chatsObj;
			// });
		},
		createMsgsChat: (state, action) => {
			// console.log(action.payload);
			return [
				...state,
				{
					contactId: action.payload.contactId,
					messages: [...action.payload.messages.reverse()],
					queryOffset: 0,
					lastAcc: Date.now(),
				},
			];
		},
		incrementQueryOffset: (state, action) => {
			// console.log(action.payload);
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload
					? {
							contactId: chatsObj.contactId,
							messages: chatsObj.messages,
							queryOffset: chatsObj.queryOffset + 10,
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
		},
		decrementQueryOffset: (state, action) => {
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload
					? {
							contactId: chatsObj.contactId,
							messages: chatsObj.messages,
							queryOffset: chatsObj.queryOffset - 10,
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
		},
		clearCache: (state, action) => {
			const newAllMsgsState = [];
			for (let i = 0; i < state.length; i++) {
				const msgsObj = state[i];
				const dateNow = Date.now();
				if (
					msgsObj.contactId !== action.payload.contactId &&
					msgsObj.lastAcc + 60 < dateNow
				) {
					newAllMsgsState.push({
						...msgsObj,
						messages: msgsObj.messages.slice(-5),
					});
				} else if (
					msgsObj.contactId !== action.payload.contactId &&
					msgsObj.lastAcc + 30 < dateNow
				) {
					continue;
				} else {
					newAllMsgsState.push(msgsObj);
				}
			}
			return newAllMsgsState;
		},
	},
});

export const {
	addMsg,
	addMsgs,
	createMsgsChat,
	incrementQueryOffset,
    decrementQueryOffset,
	clearCache,
} = chatSlice.actions;
// export const selectContacts = (state) => state.chats.contacts;
// export const selectActiveChat = (state) => state.chats.activeChat;
// export const selectMessages = (state) => state.chats
// export const selectMessages = (contactId) => (state) => {
//     for (let i = 0; i < state.chats.length; i++) {
//         if (state.chats[i].contactId === contactId) {
//             return state.chats[i]
//         }
//     }
// };
export const selectQueryOffset = (contactId) => (state) => {
	for (let i = 0; i < state.chats.length; i++) {
		if (state.chats[i].contactId === contactId) {
			// console.log("found");
			return state.chats[i].queryOffset;
		}
	}
	return null;
};
export default chatSlice.reducer;

// addMsg: (state, action) => {
//     return {
//         ...state,
//         [action.payload.contactId]: { // Only include friend's Id in the dispatcher, not in the sent WS msg
//             messages: [
//                 ...state.contactId.messages,
//                 action.payload.message
//             ],
//             lastAcc: Date.now()
//         }
//     }
// },
// initContacts: (state, action) => {
// 	return {
// 		...state,
// 		contacts: action.payload,
// 		allMessages: action.payload.map((contact) => {
// 			return {
// 				contactId: contact.user_id,
// 				messages: [],
// 				lastAcc: Date.now(),
// 			};
// 		}),
// 	};
// },
// setActiveChat: (state, action) => {
// 	return {
// 		...state,
// 		activeChat: action.payload,
// 	};
// },
// addChat: (state, action) => {
// 	return {
// 		...state,
// 		allMessages: state.allMessages.push({
// 			contactId: action.payload.contactId,
// 			messages: [],
// 			lastAcc: Date.now(),
// 		}),
// 	};
// },
// addMsg: (state, action) => {
// 	return {
// 		...state,
// 		allMessages: state.allMessages.map((chatsObj) =>
// 			chatsObj.contactId === action.payload.contactId
// 				? {
// 						contactId: chatsObj.contactId,
// 						messages: [
// 							...chatsObj.messages, // [{msg1}, {msg2}], destruct will {msg1}, {msg2}
// 							action.payload,
// 						],
// 						lastAcc: Date.now(),
// 				  }
// 				: chatsObj,
// 		),
// 	};
// },
// addMsgs: (state, action) => {
// 	console.log(action.payload);
// 	return {
// 		...state,
// 		allMessages: state.allMessages.map((chatsObj) =>
// 			chatsObj.contactId === action.payload.contactId
// 				? {
// 						contactId: chatsObj.contactId,
// 						messages: action.payload.messages,
// 						lastAcc: Date.now(),
// 				  }
// 				: chatsObj,
// 		),
// 	};
// },
// clearCache: (state, action) => {
// 	const newAllMsgsState = [];
// 	for (let i = 0; i < state.allMessages.length; i++) {
// 		const chatObj = state.allMessages[i];
// 		const dateNow = Date.now();
// 		if (
// 			chatObj.contactId !== action.payload.contactId &&
// 			chatObj.lastAcc + 60 < dateNow
// 		) {
// 			newAllMsgsState.push({
// 				// contactId: chatObj.contactId,
// 				...chatObj,
// 				messages: chatObj.messages.slice(-5),
// 				// lastAcc: chatObj.lastAcc,
// 			});
// 		} else if (
// 			chatObj.contactId !== action.payload.contactId &&
// 			chatObj.lastAcc + 30 < dateNow
// 		) {
// 			continue;
// 		} else {
// 			newAllMsgsState.push(chatObj);
// 		}
// 	}
// 	return {
// 		...state,
// 		allMessages: newAllMsgsState,
// 	};
// 	// return newAllMsgsState;
// },
