import React from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../slices/themeSlice";
import {
	// StyledMsgCtn,
	StyledMsg,
	// StyledLoadingMsg,
	StyledMsgDate,
	MsgFlareLeft,
	MsgFlareRight,
} from "../../stitches-components/chatStyled";

function Message({ date, rcvdMsg, text, time, noFlare, marginTop }) {
	const theme = useSelector(selectTheme);
	return (
		<>
			{date && (
				<StyledMsgDate
					css={{
						alignSelf: "center",
						backgroundColor: theme.accCol,
						color: theme.contrast ? "white" : "black",
					}}
				>
					{date}
				</StyledMsgDate>
			)}
			<StyledMsg
				css={{
					backgroundColor: theme.primCol,
					alignSelf: rcvdMsg ? "flex-start" : "flex-end",
                    alignItems: rcvdMsg ? "flex-start" : "flex-end",
					borderRadius: noFlare
						? "0.4em 0.4em 0.4em 0.4em"
						: rcvdMsg
						? " 0 0.4em 0.4em 0.4em"
						: "0.4em 0 0.4em 0.4em",
					marginTop: marginTop ? marginTop : "",
				}}
			>
				<p>{text}</p>
				<span>{time}</span>
				{noFlare ? (
					<></>
				) : rcvdMsg ? (
					<MsgFlareLeft
						css={{
							backgroundColor: theme.primCol,
						}}
					/>
				) : (
					<MsgFlareRight
						css={{
							backgroundColor: theme.primCol,
						}}
					/>
				)}
			</StyledMsg>
		</>
	);
}

export default Message;
