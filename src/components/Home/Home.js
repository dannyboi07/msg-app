import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { selectUserId, selectUser } from "../../slices/userSlice";
import { StyledHome } from "../../stitches-components/homeStyled";
import Chat from "../Chat/Chat";
import Contacts from "./Contacts";
import WsMsgHandler from "./WsMsgHandler";

function Home() {
	const user = useSelector(selectUser);

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

	useEffect(() => {
		async function refreshToken() {
			await axios.get("http://localhost:8080/api/auth/refresh_token", {
				withCredentials: true,
			});
		}

		// refreshInterval.current = setInterval(() => {
		//     // lazyFetch();
		//     refreshToken();
		// }, 5000); // 1000 * 10

		// return (() => clearInterval(refreshInterval.current))
	}, []);

	return (
		<StyledHome>
			<Contacts />
			<Chat userId={user.user_id} wsConn={wsConn} />
			<WsMsgHandler userId={user.user_id} wsConn={wsConn} />
		</StyledHome>
	);
}

export default Home;
