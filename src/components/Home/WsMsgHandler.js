import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	createMsgsChat,
	addMsg,
	selectExistingCaches,
} from "../../slices/chatSlice";
import { updatePendingMsgs } from "../../slices/contactsSlice";

function WsMsgHandler({ wsConn, userId }) {
	const dispatch = useDispatch();
    const wsConnRetryTimeout = useRef(250);
	// const [retryWsConn, setRetryWsConn] = useState(true);
	// Returns an array with the user IDs of contacts which have an active msg cache
	const existingMsgCaches = useSelector(selectExistingCaches);
	// const activeContactId = useSelector(selectActiveContact);
	const msgCachesRef = useRef([]);

    function makeConn() {
        wsConn.current = new WebSocket("ws://localhost:8080/api/ws");
        wsConn.current.addEventListener("open", onOpen);
        wsConn.current.addEventListener("close", closeRetryListener);
        wsConn.current.addEventListener("message", messageListener);
    }

	function messageListener(e) {
		const data = JSON.parse(e.data);
		if (data.last_seen) return; // Ignore msgs with last_seen field in them, will be handled by the Chat component

		const contactId = data.from === userId ? data.to : data.from;

		if (data.from === contactId) {
			dispatch(
				updatePendingMsgs({
					contactId,
					text: data.text,
				}),
			);
		}

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
	}

	function onOpen() {
		// setRetryWsConn(false);
        //console.log("wsConn open", wsConnRetryTimeout.current);
        wsConnRetryTimeout.current = 250;
        // console.log(wsConnRetryTimeout.current)
	}

	function closeRetryListener() {
		// setRetryWsConn(true);
        // wsConn.current.close();
        wsConn.current = null;
        console.log(wsConnRetryTimeout.current)
        setTimeout(() => {
            makeConn();
        }, wsConnRetryTimeout.current = wsConnRetryTimeout.current * 2)
        // wsConn.current = new WebSocket("ws://localhost:8080/api/ws");
        // console.log(wsConn.current)
	}

	useEffect(() => {
        // console.log(wsConn.current, retryWsConn)
        makeConn();
		// if (retryWsConn) {
            //console.log("inside if")
			// wsConn.current = new WebSocket("ws://localhost:8080/api/ws");
			// wsConn.current.addEventListener("open", onOpen);
			// wsConn.current.addEventListener("message", messageListener);
			// wsConn.current.addEventListener("close", closeRetryListener);
			// wsConn.current.addEventListener("error", closeRetryListener);
		// }

		return () => {
			console.log("wsConn closing");
            if (wsConn.current) {
                wsConn.current.removeEventListener("open", onOpen);
                wsConn.current.removeEventListener("message", messageListener);
                wsConn.current.removeEventListener("close", closeRetryListener);
                // wsConn.current.removeEventListener("error", closeRetryListener);
                wsConn.current.close(1000);
            }
		};
	}, []);

	useEffect(() => {
		msgCachesRef.current = existingMsgCaches;
	}, [existingMsgCaches]);

	return <div></div>;
}

export default WsMsgHandler;
