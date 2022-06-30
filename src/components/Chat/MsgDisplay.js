import React, { useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	StyledMsgCtn,
	StyledMsg,
	StyledLoadingMsg,
	StyledMsgDate,
	MsgFlareLeft,
	MsgFlareRight,
} from "../../stitches-components/chatStyled";
import { selectTheme } from "../../slices/themeSlice";
import { incrementQueryOffset, selectQueryDone } from "../../slices/chatSlice";
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
	const msgCtnRef = useRef(null);
	const scrollToBottomRef = useRef(null);
	const contactMsgs = useSelector((state) => {
		for (let i = 0; i < state.chats.length; i++) {
			if (state.chats[i].contactId === activeContactId) {
                // console.log("messages useselector")
				return state.chats[i].messages;
			}
		}
		return null;
	});
	const queryDone = useSelector(selectQueryDone(activeContactId));
	const theme = useSelector(selectTheme);

	function scroll() {
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
		// Fix scroll to bottom initial mount after initial set of messages are loaded
		if (toScroll && !isLoading && contactMsgs) {
            // console.log("useeffect if, pulling hard")
			scrollToBottomRef.current.scrollIntoView();
			setToScroll(false);
		} else if (
			// Scroll to bottom when a new message arrives
			contactMsgs
		) {
            // console.log("useeffect else if")
			if (
				msgCtnRef.current.scrollHeight -
					msgCtnRef.current.clientHeight -
					msgCtnRef.current.scrollTop <
				200
			) { 
                // console.log("pulling smooth")
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
								// <Message
								// 	key={message.message_id}
								// 	date={dateTime.date}
								// 	rcvdMsg={rcvdMsg}
								// 	text={message.text}
								// 	time={dateTime.time}
								// 	noFlare={false}
								// />
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
									contactMsgs[i - 1].time,
								).toLocaleDateString()
							) {
								return (
									// <Message
                                    //     key={message.message_id}
									// 	date={dateTime.date}
									// 	rcvdMsg={rcvdMsg}
                                    //     text={message.text}
                                    //     time={dateTime.time}
                                    //     noFlare={false}
									// />
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
								if (message.from === contactMsgs[i - 1].from) {
									return (
                                        // <Message 
                                        //     key={message.message_id}
                                        //     rcvdMsg={rcvdMsg}
                                        //     text={message.text}
                                        //     time={dateTime.time}
                                        //     noFlare={true}
                                        // />
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
                                    // <Message 
                                    //     key={message.message_id}
                                    //     rcvdMsg={rcvdMsg}
                                    //     text={message.text}
                                    //     time={dateTime.time}
                                    //     noFlare={true}
                                    //     marginTop="0.75em"
                                    // />
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
