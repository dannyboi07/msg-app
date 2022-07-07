import { createSlice } from "@reduxjs/toolkit";

/* 
Structure of the state:
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
        queryOffset: Last query offset used while retrieving this contact's messages,
        queryDone: Boolean that is true when user has finished getting every message from the server through scroll pagination,
        lastAcc: Latest time in seconds this a particular object such as this was touched by the user,
        // So be used while scanning this state to clear "cache" at regular intervals 
    }
]
*/

export const chatSlice = createSlice({
	name: "chats",
	initialState: [],
	reducers: {
		createMsgsChat: (state, action) => {
			return [
				...state,
				{
					contactId: action.payload.contactId,
					messages: [...action.payload.messages.reverse()],
					queryOffset: 0,
					queryDone: false,
					lastAcc: Date.now(),
				},
			];
		},
		addMsgs: (state, action) => {
			const reversedMsgs = action.payload.messages.reverse();
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload.contactId
					? {
							...chatsObj,
							messages: [...reversedMsgs, ...chatsObj.messages],
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
		},
		addMsg: (state, action) => {
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload.contactId
					? chatsObj.messages.length >= 10
						? {
								...chatsObj,
								messages: [
									...chatsObj.messages.slice(1),
									action.payload.message,
								],
								lastAcc: Date.now(),
						  }
						: {
								...chatsObj,
								messages: [
									...chatsObj.messages,
									action.payload.message,
								],
								lastAcc: Date.now(),
						  }
					: chatsObj,
			);
		},
		incrementQueryOffset: (state, action) => {
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload
					? {
							...chatsObj,
							queryOffset: chatsObj.queryOffset + 10,
							lastAcc: Date.now(),
					  }
					: chatsObj,
			);
		},
		setQueryDone: (state, action) => {
			return state.map((chatsObj) =>
				chatsObj.contactId === action.payload
					? {
							...chatsObj,
							queryDone: true,
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
		eraseChatState: () => {
			return [];
		},
	},
});

export const {
	addMsg,
	addMsgs,
	createMsgsChat,
	incrementQueryOffset,
	setQueryDone,
	clearCache,
    eraseChatState
} = chatSlice.actions;

export const selectQueryOffset = (contactId) => (state) => {
	for (let i = 0; i < state.chats.length; i++) {
		if (state.chats[i].contactId === contactId) {
			return state.chats[i].queryOffset;
		}
	}
	return null;
};

export const selectExistingCaches = (state) => {
	return state.chats.map((chatsObj) => chatsObj.contactId);
};

export const selectQueryDone = (contactId) => (state) => {
	for (let i = 0; i < state.chats.length; i++) {
		if (state.chats[i].contactId === contactId)
			return state.chats[i].queryDone;
	}
	return null;
};

export default chatSlice.reducer;

// decrementQueryOffset: (state, action) => {
// 	return state.map((chatsObj) =>
// 		chatsObj.contactId === action.payload
// 			? {
//                     ...chatsObj,
// 					queryOffset: chatsObj.queryOffset - 10,
// 					lastAcc: Date.now(),
// 			  }
// 			: chatsObj,
// 	);
// },
