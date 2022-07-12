import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	createMsgsChat,
	addMsg,
	selectExistingCaches,
} from "../../slices/chatSlice";
import { updatePendingMsgs } from "../../slices/contactsSlice";
import { setRefreshFalse, setRefreshTrue } from "../../slices/refreshSlice";
import { selectToast, setToast } from "../../slices/toastSlice";

function WsMsgHandler({ wsConn, userId }) {
	const dispatch = useDispatch();
	const wsConnRetryTimeout = useRef(250);

	// Returns an array with the user IDs of contacts which have an active msg cache
	const existingMsgCaches = useSelector(selectExistingCaches);
	const msgCachesRef = useRef([]);

	const toast = useSelector(selectToast);
	const toastRef = useRef(null);

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
		if (wsConnRetryTimeout.current > 999) {
			dispatch(
				setToast({
					type: "suc",
					title: "Reconnected",
				}),
			);
			dispatch(setRefreshFalse());
		}
		wsConnRetryTimeout.current = 250;
	}

	function closeRetryListener() {
		wsConn.current = null;
		// Retry connection while backing off exponentially
		if (
			wsConnRetryTimeout.current > 999 &&
			wsConnRetryTimeout.current < 64001 &&
			(!toastRef.current || toastRef.current.type !== "warn")
		) {
			dispatch(
				setToast({
					type: "warn",
					title: "Connection lost",
					message: "Re-establishing connection",
				}),
			);
            dispatch(setRefreshTrue());
		}

		if (wsConnRetryTimeout.current < 64001) {
			setTimeout(() => {
				makeConn();
			}, (wsConnRetryTimeout.current = wsConnRetryTimeout.current * 2));
		}
	}

	useEffect(() => {
		makeConn();

		return () => {
			console.log("wsConn closing");
			if (wsConn.current) {
				wsConn.current.removeEventListener("open", onOpen);
				wsConn.current.removeEventListener("message", messageListener);
				wsConn.current.removeEventListener("close", closeRetryListener);
				wsConn.current.close(1000);
			}
		};
	}, []);

	useEffect(() => {
		msgCachesRef.current = existingMsgCaches;
	}, [existingMsgCaches]);

	useEffect(() => {
		toastRef.current = toast;
	}, [toast]);

	return <div></div>;
}

export default WsMsgHandler;
