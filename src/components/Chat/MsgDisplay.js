import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
// import { selectMessages } from "../../slices/chatSlice";
import {
	StyledMsgCtn,
	StyledMsg,
	StyledMsgDate,
	MsgFlareLeft,
	MsgFlareRight,
} from "../../stitches-components/chatStyled";

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

function MsgDisplay({ activeContactId }) {
	const msgCtnRef = useRef(null);
	const scrollToBottomRef = useRef(null);
	const contactMsgs = useSelector((state) =>
		state.chats.find((chatsObj) => chatsObj.contactId === activeContactId),
	);

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
				300
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
		<StyledMsgCtn ref={msgCtnRef}>
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
									}}
								>
									{date}
								</StyledMsgDate>
								<StyledMsg
									css={{
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
										<MsgFlareLeft />
									) : (
										<MsgFlareRight />
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
											alignSelf: "center",
										}}
									>
										{date}
									</StyledMsgDate>
									<StyledMsg
										css={{
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
											<MsgFlareLeft />
										) : (
											<MsgFlareRight />
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
									<React.Fragment key={message.message_id}>
										<StyledMsg
											css={{
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
										<MsgFlareLeft />
									) : (
										<MsgFlareRight />
									)}
								</StyledMsg>
							);
						}
					}
				})}
			<div ref={scrollToBottomRef} />
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
