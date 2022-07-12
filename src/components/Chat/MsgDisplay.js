import React, { useState, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	StyledMsgCtn,
	StyledMsg,
	StyledLoadingMsg,
	StyledMsgDate,
	MsgFlareLeft,
	MsgFlareRight,
	StyledGoDown,
} from "../../stitches-components/chatStyled";
import { selectTheme } from "../../slices/themeSlice";
import { incrementQueryOffset, selectQueryDone } from "../../slices/chatSlice";
import { selectRefresh } from "../../slices/refreshSlice";
import Message from "./Message";

function parseSectionTime(msgTime) {
	const dateTime = new Date(msgTime);
	const date = dateTime.toLocaleString("en-US", {
		dateStyle: "long",
	});
	const time = dateTime.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	});
	const currDate = new Date();
	if (
		dateTime.getMonth() === currDate.getMonth() &&
		dateTime.getFullYear() === currDate.getFullYear()
	) {
		if (dateTime.getDate() === currDate.getDate())
			return { dateTime, date: "Today", time };
		else if (dateTime.getDate() === currDate.getDate() - 1)
			return { dateTime, date: "Yesterday", time };
	}
	return { dateTime, date, time };
}

function MsgDisplay({
	activeContactId,
	isLoading,
	toScroll,
	setToScroll,
	pausePaging,
	setPausePaging,
}) {
	const dispatch = useDispatch();
	const [scrollDownBtn, setScrollDownBtn] = useState(false);
	const msgCtnRef = useRef(null);
	const scrollToBottomRef = useRef(null);
	const contactMsgs = useSelector((state) => {
		for (let i = 0; i < state.chats.length; i++) {
			if (state.chats[i].contactId === activeContactId) {
				return state.chats[i].messages;
			}
		}
		return null;
	});
	const queryDone = useSelector(selectQueryDone(activeContactId));
	const theme = useSelector(selectTheme);
	// const refresh = useSelector(selectRefresh);

	function scroll() {
		console.log("triggered");
		// If scrollBottom is greater than 200 and scrollBtn is hidden
		// Added isLoading to the condition to fix the bug of the scroll button from appearing when switching between contacts
		if (
			!scrollDownBtn &&
			!isLoading &&
			msgCtnRef.current.scrollHeight -
				msgCtnRef.current.clientHeight -
				msgCtnRef.current.scrollTop >
				200
		) {
			setScrollDownBtn(true);
		} else if (
			scrollDownBtn &&
			msgCtnRef.current.scrollHeight -
				msgCtnRef.current.clientHeight -
				msgCtnRef.current.scrollTop <
				200
		) {
			setScrollDownBtn(false);
		}

		if (
			!queryDone &&
			!isLoading &&
			contactMsgs &&
			!pausePaging &&
			msgCtnRef.current.scrollTop < 20
		) {
			dispatch(incrementQueryOffset(activeContactId));
			setPausePaging(true); // Fix for extra query made when null is received
		}
	}

	useLayoutEffect(() => {
		// console.log(toScroll, isLoading);
		// Fix scroll to bottom initial mount after initial set of messages are loaded
		if (toScroll && !isLoading && contactMsgs) {
			scrollToBottomRef.current.scrollIntoView();
			setToScroll(false);
		} else if (
			// Scroll to bottom when a new message arrives
			contactMsgs
		) {
			if (
				msgCtnRef.current.scrollHeight -
					msgCtnRef.current.clientHeight -
					msgCtnRef.current.scrollTop <
				200
			) {
				scrollToBottomRef.current.scrollIntoView({
					behavior: "smooth",
				});
			}
			setToScroll(false);
		}
	}, [toScroll, isLoading, contactMsgs]);

	useLayoutEffect(() => {
		if (contactMsgs) {
			scrollToBottomRef.current.scrollIntoView();
		}
	}, [activeContactId]);

	return (
		<StyledMsgCtn
			css={{
				backgroundColor: theme.secCol,
			}}
		>
			<div className="viewport-ctn" onScroll={scroll} ref={msgCtnRef}>
				{isLoading &&
					[0, 0, 0, 0, 0].map((_, i) =>
						i % 2 === 0 ? (
							<StyledLoadingMsg
								key={i}
								css={{
									backgroundColor: theme.primCol,
									alignSelf: "flex-end",
									alignItems: "flex-end",
									borderRadius: "5px 0 5px 5px",
								}}
							>
								{[0, 0, 0, 0].map((_, i) => (
									<div key={i}>
										<div />
									</div>
								))}
								<MsgFlareRight
									css={{
										backgroundColor: theme.primCol,
									}}
								/>
							</StyledLoadingMsg>
						) : (
							<StyledLoadingMsg
								key={i}
								css={{
									backgroundColor: theme.primCol,
									alignSelf: "flex-start",
									borderRadius: "0 5px 5px 5px",
								}}
							>
								{[0, 0, 0, 0].map((_, i) => (
									<div key={i}>
										<div />
									</div>
								))}
								<MsgFlareLeft
									css={{ backgroundColor: theme.primCol }}
								/>
							</StyledLoadingMsg>
						),
					)}
				{contactMsgs &&
					contactMsgs.map((message, i) => {
						const dateTime = parseSectionTime(message.time);
						const rcvdMsg = message.from === activeContactId;
						if (i === 0) {
							return (
								<Message
									key={message.message_id}
									date={dateTime.date}
									rcvdMsg={rcvdMsg}
									text={message.text}
									time={dateTime.time}
									noFlare={false}
								/>
							);
						} else {
							if (
								dateTime.dateTime.toLocaleDateString() >
								new Date(
									contactMsgs[i - 1].time,
								).toLocaleDateString()
							) {
								return (
									<Message
										key={message.message_id}
										date={dateTime.date}
										rcvdMsg={rcvdMsg}
										text={message.text}
										time={dateTime.time}
										noFlare={false}
									/>
								);
							} else {
								if (message.from === contactMsgs[i - 1].from) {
									return (
										<Message
											key={message.message_id}
											rcvdMsg={rcvdMsg}
											text={message.text}
											time={dateTime.time}
											noFlare={true}
										/>
									);
								}
								return (
									<Message
										key={message.message_id}
										rcvdMsg={rcvdMsg}
										text={message.text}
										time={dateTime.time}
										// noFlare={false}
										marginTop="0.75em"
									/>
								);
							}
						}
					})}
				<div ref={scrollToBottomRef} />
			</div>

			<StyledGoDown
				className={`go-down-btn ${
					scrollDownBtn ? "go-down-btn--show" : ""
				}`}
				css={{
					backgroundColor: theme.accCol,
					color: theme.contrast ? "white" : "black",
				}}
				onClick={() => scrollToBottomRef.current.scrollIntoView()}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.14645 6.85355C7.34171 7.04882 7.65829 7.04882 7.85355 6.85355L11.8536 2.85355C12.0488 2.65829 12.0488 2.34171 11.8536 2.14645C11.6583 1.95118 11.3417 1.95118 11.1464 2.14645L7.5 5.79289L3.85355 2.14645ZM3.85355 8.14645C3.65829 7.95118 3.34171 7.95118 3.14645 8.14645C2.95118 8.34171 2.95118 8.65829 3.14645 8.85355L7.14645 12.8536C7.34171 13.0488 7.65829 13.0488 7.85355 12.8536L11.8536 8.85355C12.0488 8.65829 12.0488 8.34171 11.8536 8.14645C11.6583 7.95118 11.3417 7.95118 11.1464 8.14645L7.5 11.7929L3.85355 8.14645Z"
						fill="currentColor"
						fillRule="evenodd"
						clipRule="evenodd"
					></path>
				</svg>
			</StyledGoDown>
		</StyledMsgCtn>
	);
}

export default MsgDisplay;

// <React.Fragment key={message.message_id}>
// 	<StyledMsgDate
// 		css={{
// 			alignSelf: "center",
// 			backgroundColor: theme.accCol,
// 			color: theme.contrast
// 				? "white"
// 				: "black",
// 			position: "sticky",
// 			top: 10,
//             zIndex: 1
// 		}}
// 	>
// 		{dateTime.date}
// 	</StyledMsgDate>
// 	<StyledMsg
// 		css={{
// 			backgroundColor: theme.primCol,
// 			alignSelf: rcvdMsg
// 				? "flex-start"
// 				: "flex-end",
// 			borderRadius: rcvdMsg
// 				? "0 0.4em 0.4em 0.4em"
// 				: "0.4em 0 0.4em 0.4em",
// 		}}
// 	>
// 		<p>{message.text}</p>
// 		<span>{dateTime.time}</span>
// 		{rcvdMsg ? (
// 			<MsgFlareLeft
// 				css={{
// 					backgroundColor:
// 						theme.primCol,
// 				}}
// 			/>
// 		) : (
// 			<MsgFlareRight
// 				css={{
// 					backgroundColor:
// 						theme.primCol,
// 				}}
// 			/>
// 		)}
// 	</StyledMsg>
// </React.Fragment>

// <React.Fragment key={message.message_id}>
// 	<StyledMsgDate
// 		css={{
// 			backgroundColor: theme.accCol,
// 			alignSelf: "center",
// 			color: theme.contrast
// 				? "white"
// 				: "black",
// 			position: "sticky",
// 			top: 10,
//             zIndex: 1
// 		}}
// 	>
// 		{dateTime.date}
// 	</StyledMsgDate>
// 	<StyledMsg
// 		css={{
// 			backgroundColor: theme.primCol,
// 			alignSelf: rcvdMsg
// 				? "flex-start"
// 				: "flex-end",
// 			borderRadius: rcvdMsg
// 				? "0 0.4em 0.4em 0.4em"
// 				: "0.4em 0 0.4em 0.4em",
// 		}}
// 	>
// 		<p>{message.text}</p>

// 		<span>{dateTime.time}</span>
// 		{rcvdMsg ? (
// 			<MsgFlareLeft
// 				css={{
// 					backgroundColor:
// 						theme.primCol,
// 				}}
// 			/>
// 		) : (
// 			<MsgFlareRight
// 				css={{
// 					backgroundColor:
// 						theme.primCol,
// 				}}
// 			/>
// 		)}
// 	</StyledMsg>
// </React.Fragment>

// <React.Fragment
// 	key={message.message_id}
// >
// 	<StyledMsg
// 		css={{
// 			backgroundColor:
// 				theme.primCol,
// 			alignSelf: rcvdMsg
// 				? "flex-start"
// 				: "flex-end",
// 			borderRadius:
// 				"0.4em 0.4em 0.4em 0.4em",
// 		}}
// 	>
// 		<p>{message.text}</p>

// 		<span>{dateTime.time}</span>
// 	</StyledMsg>
// </React.Fragment>

// <StyledMsg
// 	css={{
// 		backgroundColor: theme.primCol,
// 		alignSelf: rcvdMsg
// 			? "flex-start"
// 			: "flex-end",
// 		borderRadius: rcvdMsg
// 			? "0 0.4em 0.4em 0.4em"
// 			: "0.4em 0 0.4em 0.4em",
// 		marginTop: "0.75em",
// 	}}
// 	key={message.message_id}
// >
// 	<p>{message.text}</p>
// 	<span>{dateTime.time}</span>
// 	{rcvdMsg ? (
// 		<MsgFlareLeft
// 			css={{
// 				backgroundColor:
// 					theme.primCol,
// 			}}
// 		/>
// 	) : (
// 		<MsgFlareRight
// 			css={{
// 				backgroundColor:
// 					theme.primCol,
// 			}}
// 		/>
// 	)}
// </StyledMsg>
