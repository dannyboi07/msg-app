import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import {
	addMsgs,
	createMsgsChat,
	selectQueryOffset,
	decrementQueryOffset,
} from "../../slices/chatSlice";
import { selectActiveContact } from "../../slices/contactsSlice";
import { selectTheme } from "../../slices/themeSlice";
import {
	StyledMsgInputCtn,
	MsgInputCtn,
} from "../../stitches-components/chatStyled";
import { StyledChat } from "../../stitches-components/homeStyled";
import ChatProfile from "./ChatProfile";
import MsgDisplay from "./MsgDisplay";

function Chat({ userId, wsConn }) {
	const dispatch = useDispatch();

	const [msgInput, setMsgInput] = useState("");
	const [stopQuery, setStopQuery] = useState(false);
	const [toScroll, setToScroll] = useState(true);

	const msgInCtnRef = useRef(null);

	const activeContactId = useSelector(selectActiveContact);
	const theme = useSelector(selectTheme);
	const msgCacheExists = useSelector((state) =>
		state.chats.some((chat) =>
			chat.contactId === activeContactId ? true : false,
		),
	);
	const msgCacheOffset = useSelector(selectQueryOffset(activeContactId));

	const { lazyFetch, response, isLoading, error } = useLazyAxios({
		method: "GET",
		url: `/messages/${activeContactId}?skip=${msgCacheOffset}`,
		withCredentials: true,
	});

	useEffect(() => {
		if (activeContactId) {
			setStopQuery(false);
			setToScroll(true);
			if (!msgCacheExists) {
				dispatch(
					createMsgsChat({
						contactId: activeContactId,
						messages: [],
					}),
				);
			}
		}
	}, [activeContactId]);

	useEffect(() => {
		// Don't query the server any more after receiving null
		if (
			activeContactId !== null &&
			activeContactId !== undefined &&
			msgCacheOffset !== null &&
			msgCacheOffset !== undefined &&
			!stopQuery &&
			response !== null
		) {
			lazyFetch();
			console.log("lazyfetching");
		}
	}, [activeContactId, msgCacheOffset, stopQuery]);

	useEffect(() => {
		if (response && !error) {
			dispatch(
				addMsgs({
					contactId: activeContactId,
					messages: response,
				}),
			);
			// Else If: Response will be null when no more data is available, don't dispatch that response to the store
			// && notify msgDisplay through stopQuery to stop pagination, and decrement the offset
		} else if (response === null) {
			console.log("stopping");
			setStopQuery(true);
			dispatch(decrementQueryOffset(activeContactId));
		}
	}, [response]);

	function sendMsg() {
		if (msgInput.length > 0) {
			const msg = {
				type: "msg",
				from: userId,
				to: activeContactId,
				text: msgInput,
			};
			wsConn.current.send(JSON.stringify(msg));
			setMsgInput("");
		}
	}

	if (!activeContactId) {
		return (
			<StyledChat
				css={{
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: theme.primCol,
					borderLeft: `1px solid ${theme.accCol}`,
					color: theme.contrast ? "black" : "white",
				}}
			>
				<h1>Select a chat</h1>
			</StyledChat>
		);
	}

	return (
		<StyledChat
			css={{
				backgroundColor: theme.primCol,
				borderLeft: `1px solid ${theme.accCol}`,
				color: theme.contrast ? "black" : "white",
			}}
		>
			<ChatProfile wsConn={wsConn} />
			{activeContactId && (
				<MsgDisplay
					activeContactId={activeContactId}
					isLoading={isLoading}
					toScroll={toScroll}
					setToScroll={setToScroll}
					stopQuery={stopQuery}
					// msgQueryOffset={msgCacheOffset}
				/>
			)}
			{activeContactId && (
				<MsgInputCtn
					css={{
						backgroundColor: "transparent",
					}}
				>
					<StyledMsgInputCtn ref={msgInCtnRef}>
						<textarea
							style={{
								color: theme.contrast ? "black" : "white",
							}}
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
					</StyledMsgInputCtn>
					<button
						style={{
							backgroundColor: theme.secCol,
							color: theme.contrast ? "black" : "white",
						}}
						onClick={sendMsg}
						disabled={msgInput === "" ? true : false}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z"
								fill="currentColor"
								fillRule="evenodd"
								clipRule="evenodd"
							></path>
						</svg>
					</button>
				</MsgInputCtn>
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
