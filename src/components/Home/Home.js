import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useGetContactsQuery, useWsConnectionQuery } from "../../api/apiSlice";
// import { setToast } from "../../slices/toastSlice";
import { selectUserId } from "../../slices/userSlice";
import { addMsg } from "../../slices/chatSlice";
import { StyledHome } from "../../stitches-components/homeStyled";
import Chat from "../Chat/Chat";
import Contacts from "./Contacts";

function Home() {
	const dispatch = useDispatch();
	const userId = useSelector(selectUserId);
	const wsConn = useRef(null);

	useEffect(() => {
		wsConn.current = new WebSocket("ws://localhost:8080/api/ws");

		wsConn.current.addEventListener("message", (e) => {
			const data = JSON.parse(e.data);
            if (data.last_seen) return;
            console.log("home component received ws msg", data)
			const contactId = data.from === userId ? data.to : data.from;
			dispatch(
				addMsg({
					contactId,
					message: data,
				}),
			);
		});

		return () => {
			wsConn.current.close(1000);
		};
	}, []);

	return (
		<StyledHome>
			<Contacts />
			<Chat userId={userId} wsConn={wsConn}/>
		</StyledHome>
	);
}

export default Home;

// const { data, isFetching, error } = useGetContactsQuery();
// const { wsData, wsIsFetching, wsError } = useWsConnectionQuery();
// useEffect(() => {
// 	if (error) {
// 		dispatch(
// 			setToast({
// 				type: "err",
// 				message: error,
// 			}),
// 		);
// 	}
// }, [error]);
// console.log(wsData, wsIsFetching, wsError);
