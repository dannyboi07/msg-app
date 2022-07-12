import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { eraseChatState } from "../../slices/chatSlice";
import { eraseContactsState } from "../../slices/contactsSlice";
import { selectUserId, selectUser } from "../../slices/userSlice";
import { StyledHome } from "../../stitches-components/homeStyled";
import Chat from "../Chat/Chat";
import ContactRefreshHandler from "./ContactRefreshHandler";
import Contacts from "./Contacts";
import WsMsgHandler from "./WsMsgHandler";

function Home() {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
    const [activeContactId, setActiveContactId] = useState(null);

	const refreshInterval = useRef(null);
	const wsConn = useRef(null);

	// const { lazyFetch } = useLazyAxios({
	//     method: "/GET",
	//     url: "/auth/refresh_token",
	//     withCredentials: true
	// })
	// console.log("accTkExp \n", new Date(user.acc_tk_exp));
	// console.log("refTkExp \n", new Date(user.ref_tk_exp));
	// console.log(
	// 	new Date(user.acc_tk_exp) - new Date(),
	// 	new Date() - new Date(user.acc_tk_exp) < 900,   // Check if less than
	// );

	// useEffect(() => {
	// 	// async function refreshToken() {
	// 	// 	await axios.get("http://localhost:8080/api/auth/refresh_token", {
	// 	// 		withCredentials: true,
	// 	// 	});
	// 	// }

	// 	// refreshInterval.current = setInterval(() => {
	// 	//     // lazyFetch();
	// 	//     refreshToken();
	// 	// }, 5000); // 1000 * 10
    //     dispatch(eraseChatState());
    //     dispatch(eraseContactsState());
	// 	// return (() => clearInterval(refreshInterval.current))
	// }, [remountKey]);
    
    // useEffect(() => {
        
    //     return () => {
    //         dispatch(eraseChatState());
    //         dispatch(eraseContactsState());
    //     };
    // }, [])

	return (
		<StyledHome>
			<Contacts />
			<Chat userId={user.user_id} wsConn={wsConn} activeContactId={activeContactId} />
			<WsMsgHandler userId={user.user_id} wsConn={wsConn} />
            <ContactRefreshHandler setActiveContactId={setActiveContactId} />
		</StyledHome>
	);
}

export default Home;
