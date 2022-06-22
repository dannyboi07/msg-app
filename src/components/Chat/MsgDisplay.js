import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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

function scroll(ref, setMsgQueryOffset, isLoading) {
	// When using a non exact comparison (>/<), this will trigger the setState for every pixel change below that limit, for eg 40
	// which in turn will trigger multiple queries based on the query logic residing in the parent component.
	// isLoading is an indicator that the query is loading, using that to wait until the query is completed to send the next query.
	// Only trigger when scrollTop space is less than 40 pixels and when a previous query has been completed - when isLoading is false
	if (ref.current.scrollTop < 40 && !isLoading) {
		console.log("reached top");
		setMsgQueryOffset((prev) => prev + 10);
	}
}

function ParseDate(dateTime) {
	const months = [
		"Janunary",
		"February",
		"March",
		"April",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	// const d = new Date();
	const date = dateTime.getDate();
	const month = months[dateTime.getMonth()];
	const year = dateTime.getFullYear();
	const hour = dateTime.getHours();
	const minutes = dateTime.getMinutes();

	return {
		date: `${date} ${month} ${year}`,
		time: `${hour}:${minutes}`,
	};
}

function MsgDisplay({ activeContactId, setMsgQueryOffset, isLoading }) {
	const msgCtnRef = useRef(null);
	const scrollToBottomRef = useRef(null);
	const contactMsgs = useSelector((state) =>
		state.chats.find((chatsObj) => chatsObj.contactId === activeContactId),
	);
	const theme = useSelector(selectTheme);

	useEffect(() => {
		if (!scrollToBottomRef.current.mounted && contactMsgs) {
			scrollToBottomRef.current.scrollIntoView();
			scrollToBottomRef.current.mounted = true;
		} else if (
			scrollToBottomRef.current.mounted &&
			contactMsgs &&
			msgCtnRef.current.scrollHeight -
				msgCtnRef.current.clientHeight -
				msgCtnRef.current.scrollTop <
				200
		) {
			scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [contactMsgs]);

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
				onScroll={() => scroll(msgCtnRef, setMsgQueryOffset, isLoading)}
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
						const dateTime = new Date(message.time);
						const date = dateTime.toLocaleString("en-US", {
							dateStyle: "long",
						});
						const time = dateTime.toLocaleString("en-US", {
							hour: "numeric",
							minute: "numeric",
							hour12: true,
						});
						const rcvdMsg = message.from === activeContactId;
						if (i === 0) {
							return (
								<React.Fragment key={message.message_id}>
									<StyledMsgDate
										css={{
											alignSelf: "center",
											backgroundColor: theme.accCol,
										}}
									>
										{date}
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
										<span>{time}</span>
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
								dateTime.toLocaleDateString() >
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
											}}
										>
											{date}
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

											<span>{time}</span>
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

												<span>{time}</span>
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
										<span>{time}</span>
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
