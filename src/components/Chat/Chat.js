import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { addMsgs } from "../../slices/chatSlice";
import { selectActiveContact } from "../../slices/contactsSlice";
// import { addMsg } from "../../slices/chatSlice";
import { StyledMsgInputCtn } from "../../stitches-components/chatStyled";
import { StyledChat } from "../../stitches-components/homeStyled";
import ChatProfile from "./ChatProfile";
import MsgDisplay from "./MsgDisplay";

function Chat({ userId, wsConn }) {
	const [msgInput, setMsgInput] = useState("");
	const msgInCtnRef = useRef(null);
	const dispatch = useDispatch();
	const activeContactId = useSelector(selectActiveContact);

	const { lazyFetch, response, isLoading, error } = useLazyAxios({
		method: "GET",
		url: `/messages/${activeContactId}`,
		withCredentials: true,
	});

	useEffect(() => {
		if (activeContactId) {
			lazyFetch();
		}
	}, [activeContactId]);

	useEffect(() => {
		if (activeContactId && !isLoading && !error) {
			dispatch(
				addMsgs({
					contactId: activeContactId,
					messages: response,
				}),
			);
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
			<StyledChat>
				<h1>Select a chat</h1>
			</StyledChat>
		);
	}

	return (
		<StyledChat>
            <ChatProfile wsConn={wsConn}/>
			{activeContactId && (
				<MsgDisplay activeContactId={activeContactId} />
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
