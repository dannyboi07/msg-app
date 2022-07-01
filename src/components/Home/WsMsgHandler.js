import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	createMsgsChat,
	addMsg,
	selectExistingCaches,
} from "../../slices/chatSlice";

function WsMsgHandler({ wsConn, userId }) {
	const dispatch = useDispatch();
	// Returns an array with the user IDs of contacts which have an active msg cache
	const existingMsgCaches = useSelector(selectExistingCaches);
	const msgCachesRef = useRef([]);

	useEffect(() => {
		wsConn.current = new WebSocket("ws://localhost:8080/api/ws");

		wsConn.current.addEventListener("message", (e) => {
			const data = JSON.parse(e.data);
			if (data.last_seen) return; // Ignore msgs with last_seen field in them, will be handled by the Chat component

			const contactId = data.from === userId ? data.to : data.from;

			if (msgCachesRef.current.includes(contactId)) {
				dispatch(
					addMsg({
						contactId,
						message: data,
					}),
				);
			} else {
				dispatch(
					createMsgsChat({
						contactId,
						messages: [data],
					}),
				);
			}
		});
		return () => {
			wsConn.current.close(1000);
		};
	}, []);

	useEffect(() => {
		msgCachesRef.current = existingMsgCaches;
	}, [existingMsgCaches]);

	return <div></div>;
}

export default WsMsgHandler;
