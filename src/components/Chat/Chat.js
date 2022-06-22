import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { addMsgs, createMsgsChat } from "../../slices/chatSlice";
import { selectActiveContact } from "../../slices/contactsSlice";
import { selectTheme } from "../../slices/themeSlice";
// import { addMsg } from "../../slices/chatSlice";
import { StyledMsgInputCtn } from "../../stitches-components/chatStyled";
import { StyledChat } from "../../stitches-components/homeStyled";
import ChatProfile from "./ChatProfile";
import MsgDisplay from "./MsgDisplay";

function Chat({ userId, wsConn }) {
	const [msgInput, setMsgInput] = useState("");
	const [msgQueryOffset, setMsgQueryOffset] = useState(0);
	const msgInCtnRef = useRef(null);
	const dispatch = useDispatch();
	const activeContactId = useSelector(selectActiveContact);
    const theme = useSelector(selectTheme);

	const { lazyFetch, response, isLoading, error } = useLazyAxios({
		method: "GET",
		url: `/messages/${activeContactId}?skip=${msgQueryOffset}`,
		withCredentials: true,
	});

	useEffect(() => {
		// Don't query the server any more after receiving null
		if (activeContactId && response !== null) {
			lazyFetch();
		}
	}, [activeContactId, msgQueryOffset]);

	useEffect(() => {
		if (activeContactId && !isLoading && !error) {
			if (msgQueryOffset === 0) {
				dispatch(
					createMsgsChat({
						contactId: activeContactId,
						messages: response,
					}),
				);
				return;
			}
			if (response) {
				// Response will be null when no more data is available, don't dispatch that response to the store
				dispatch(
					addMsgs({
						contactId: activeContactId,
						messages: response,
					}),
				);
			}
		}
	}, [activeContactId, isLoading, error]);

	function sendMsg() {
		const msg = {
			type: "msg",
			from: userId,
			to: activeContactId,
			text: msgInput,
		};
		wsConn.current.send(JSON.stringify(msg));
		setMsgInput("");
	}

	if (!activeContactId) {
		return (
			<StyledChat css={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.primCol,
            }}>
				<h1>Select a chat</h1>
			</StyledChat>
		);
	}

	return (
		<StyledChat css={{
            backgroundColor: theme.primCol,
        }}>
			<ChatProfile wsConn={wsConn} />
			{activeContactId && (
				<MsgDisplay
					activeContactId={activeContactId}
					setMsgQueryOffset={setMsgQueryOffset}
                    isLoading={isLoading}
				/>
			)}
			{activeContactId && (
				<StyledMsgInputCtn ref={msgInCtnRef}>
					<textarea
						value={msgInput}
						onChange={(e) => {
							setMsgInput(e.target.value);
							msgInCtnRef.current.style.height = "auto";
							msgInCtnRef.current.style.height =
								e.target.scrollHeight < 30
									? `${45}px`
									: `${e.target.scrollHeight * 2}px`;
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMsg();
							}
						}}
						placeholder="Message..."
						required
					/>
					<button onClick={sendMsg}>Send</button>
				</StyledMsgInputCtn>
			)}
		</StyledChat>
	);
}

export default Chat;

// msgInCtnRef.current.style.height = "auto"
//e.target.style.height = e.target.scrollHeight < 50 ? `${30}px` : `${e.target.scrollHeight}px`
// msgInCtnRef.current.style.height = e.target.scrollHeight
// console.log(e.target.style.height)
// e.target.innerHeight = e.target.scrollHeight
