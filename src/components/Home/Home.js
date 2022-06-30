import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { selectUserId } from "../../slices/userSlice";
import { StyledHome } from "../../stitches-components/homeStyled";
import Chat from "../Chat/Chat";
import Contacts from "./Contacts";
import WsMsgHandler from "./WsMsgHandler";

function Home() {
	const userId = useSelector(selectUserId);

	const wsConn = useRef(null);

	return (
		<StyledHome>
			<Contacts />
			<Chat userId={userId} wsConn={wsConn} />
            <WsMsgHandler userId={userId} wsConn={wsConn} />
		</StyledHome>
	);
}

export default Home;