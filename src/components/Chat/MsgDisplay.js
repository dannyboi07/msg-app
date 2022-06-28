import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { selectMessages } from "../../slices/chatSlice";
import {
	StyledMsgCtn,
	StyledMsg,
	StyledLoadingMsg,
	// StyledLoadingBg,
	StyledMsgDate,
	MsgFlareLeft,
	MsgFlareRight,
} from "../../stitches-components/chatStyled";
import { selectTheme } from "../../slices/themeSlice";
import { incrementQueryOffset } from "../../slices/chatSlice";

// function scroll(ref, activeContactId, , setMsgQueryOffset, isLoading) {
// 	// When using a non exact comparison (>/<), this will trigger the setState for every pixel change below that limit, for eg 40
// 	// which in turn will trigger multiple queries based on the query logic residing in the parent component.
// 	// isLoading is an indicator that the query is loading, using that to wait until the query is completed to send the next query.
// 	// Only trigger when scrollTop space is less than 40 pixels and when a previous query has been completed - when isLoading is false
// 	if (ref.current.scrollTop < 40 && !isLoading) {
// 		// console.log("reached top", isLoading);
// 		setMsgQueryOffset((prev) => prev + 10);

// 	}
// }

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
	setMsgQueryOffset,
	isLoading,
	toScroll,
	setToScroll,
}) {
	const dispatch = useDispatch();
	const msgCtnRef = useRef(null);
	const scrollToBottomRef = useRef(null);
	const contactMsgs = useSelector((state) =>
		state.chats.find((chatsObj) => chatsObj.contactId === activeContactId),
	);
	const theme = useSelector(selectTheme);

	function scroll() {
		if (scrollToBottomRef.current.scrollTop < 40 && !isLoading) {
			// console.log("reached top", isLoading);
			// setMsgQueryOffset((prev) => prev + 10);
			console.log("scroll dispatching");
            dispatch(incrementQueryOffset(activeContactId));
		}
	}

	useEffect(() => {
		// Fix scroll to bottom initial mount after initial set of messages are loaded
		console.log("useeffecting");
		if (toScroll && contactMsgs) {
			scrollToBottomRef.current.scrollIntoView();
			setToScroll(false);
			console.log("useeffecting if");
			// scrollToBottomRef.current.mounted = true;
		} else if (
			// Scroll to bottom when a new message arrives
			toScroll &&
			contactMsgs &&
			msgCtnRef.current.scrollHeight -
				msgCtnRef.current.clientHeight -
				msgCtnRef.current.scrollTop <
				200
		) {
			scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
			setToScroll(false);
			console.log("useeffecting else if");
		}
	}, [toScroll, contactMsgs]);

	// Fix chat scroll to bottom when switching between contacts
	// useLayoutEffect(() => {
	//     console.log("pulling", contactMsgs);
	// 	scrollToBottomRef.current.scrollIntoView();
	// }, [activeContactId]);

	// console.log(contactMsgs);

	// useEffect(() => {
	// 	if (contactMsgs) {
	// 		contactMsgs.lastAcc = Date.now();
	// 	}
	// }, [contactMsgs]);

	return (
		<StyledMsgCtn
			css={{
				backgroundColor: theme.secCol,
			}}
		>
			<div
				className="viewport-ctn"
				// Only attach scroll listener when there are messages
				// Bug fix since the scroll listener was triggering on initial mount (sometimes, possibly due to the "loading" variable)
				// when the scrollbar is at the top of the scrollable area
				// and sends a query for next batch of messages
				onScroll={() =>
					contactMsgs
						? scroll(msgCtnRef, setMsgQueryOffset, isLoading)
						: null
				}
				ref={msgCtnRef}
			>
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
					contactMsgs.messages.map((message, i) => {
						// const dateTime = new Date(message.time);
						// let date = dateTime.toLocaleString("en-US", {
						// 	dateStyle: "long",
						// });
						// const time = dateTime.toLocaleString("en-US", {
						// 	hour: "numeric",
						// 	minute: "numeric",
						// 	hour12: true,
						// });
						// const currDate = new Date();
						// if (
						// 	dateTime.getMonth() === currDate.getMonth() &&
						// 	dateTime.getFullYear() === currDate.getFullYear()
						// ) {
						// 	if (dateTime.getDate() === currDate.getDate())
						// 		date = "Today";
						// 	else if (dateTime.getDate() === currDate.getDate() - 1)
						// 		date = "Yesterday";
						// }
						const dateTime = parseSectionTime(message.time);
						const rcvdMsg = message.from === activeContactId;
						if (i === 0) {
							return (
								<React.Fragment key={message.message_id}>
									<StyledMsgDate
										css={{
											alignSelf: "center",
											backgroundColor: theme.accCol,
											color: theme.contrast
												? "white"
												: "black",
										}}
									>
										{dateTime.date}
									</StyledMsgDate>
									<StyledMsg
										css={{
											backgroundColor: theme.primCol,
											alignSelf: rcvdMsg
												? "flex-start"
												: "flex-end",
											borderRadius: rcvdMsg
												? "0 0.4em 0.4em 0.4em"
												: "0.4em 0 0.4em 0.4em",
										}}
									>
										<p>{message.text}</p>
										<span>{dateTime.time}</span>
										{rcvdMsg ? (
											<MsgFlareLeft
												css={{
													backgroundColor:
														theme.primCol,
												}}
											/>
										) : (
											<MsgFlareRight
												css={{
													backgroundColor:
														theme.primCol,
												}}
											/>
										)}
									</StyledMsg>
								</React.Fragment>
							);
						} else {
							if (
								dateTime.dateTime.toLocaleDateString() >
								new Date(
									contactMsgs.messages[i - 1].time,
								).toLocaleDateString()
							) {
								return (
									<React.Fragment key={message.message_id}>
										<StyledMsgDate
											css={{
												backgroundColor: theme.accCol,
												alignSelf: "center",
												color: theme.contrast
													? "white"
													: "black",
											}}
										>
											{dateTime.date}
										</StyledMsgDate>
										<StyledMsg
											css={{
												backgroundColor: theme.primCol,
												alignSelf: rcvdMsg
													? "flex-start"
													: "flex-end",
												borderRadius: rcvdMsg
													? "0 0.4em 0.4em 0.4em"
													: "0.4em 0 0.4em 0.4em",
											}}
										>
											<p>{message.text}</p>

											<span>{dateTime.time}</span>
											{rcvdMsg ? (
												<MsgFlareLeft
													css={{
														backgroundColor:
															theme.primCol,
													}}
												/>
											) : (
												<MsgFlareRight
													css={{
														backgroundColor:
															theme.primCol,
													}}
												/>
											)}
										</StyledMsg>
									</React.Fragment>
								);
							} else {
								if (
									message.from ===
									contactMsgs.messages[i - 1].from
								) {
									return (
										<React.Fragment
											key={message.message_id}
										>
											<StyledMsg
												css={{
													backgroundColor:
														theme.primCol,
													alignSelf: rcvdMsg
														? "flex-start"
														: "flex-end",
													borderRadius:
														"0.4em 0.4em 0.4em 0.4em",
												}}
											>
												<p>{message.text}</p>

												<span>{dateTime.time}</span>
											</StyledMsg>
										</React.Fragment>
									);
								}
								return (
									<StyledMsg
										css={{
											backgroundColor: theme.primCol,
											alignSelf: rcvdMsg
												? "flex-start"
												: "flex-end",
											borderRadius: rcvdMsg
												? "0 0.4em 0.4em 0.4em"
												: "0.4em 0 0.4em 0.4em",
											marginTop: "0.75em",
										}}
										key={message.message_id}
									>
										<p>{message.text}</p>
										<span>{dateTime.time}</span>
										{rcvdMsg ? (
											<MsgFlareLeft
												css={{
													backgroundColor:
														theme.primCol,
												}}
											/>
										) : (
											<MsgFlareRight
												css={{
													backgroundColor:
														theme.primCol,
												}}
											/>
										)}
									</StyledMsg>
								);
							}
						}
					})}
				<div ref={scrollToBottomRef} />
			</div>
		</StyledMsgCtn>
	);
}

export default MsgDisplay;

// return (
// 	<StyledMsg
// 		css={{
// 			alignSelf:
// 				message.from === activeContactId
// 					? "flex-start"
// 					: "flex-end",
// 		}}
// 		key={message.message_id}
// 	>
// 		<p>{message.text}</p>
// 		<p>{date}</p>
// 		<p>{time}</p>
// 	</StyledMsg>
// );
