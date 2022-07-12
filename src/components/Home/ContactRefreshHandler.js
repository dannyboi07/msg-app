import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectActiveContact } from "../../slices/contactsSlice";
import { selectRefresh } from "../../slices/refreshSlice";
import { setChatOnRefresh } from "../../slices/chatSlice";

function ContactRefreshHandler({ setActiveContactId }) {
	const dispatch = useDispatch();
	const activeContactId = useSelector(selectActiveContact);
	const refresh = useSelector(selectRefresh);

	useEffect(() => {
		//if (!refresh) {
		setActiveContactId(activeContactId);
		// }
	}, [activeContactId]);
	useEffect(() => {
		console.log("here", refresh);
		if (refresh === false) {
			dispatch(setChatOnRefresh());
		}
	}, [refresh]);

	return <div></div>;
}

export default ContactRefreshHandler;
