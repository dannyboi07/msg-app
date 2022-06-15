import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetContactsQuery, useWsConnectionQuery } from "../../api/apiSlice";
import { setToast } from "../../slices/toastSlice";
import Contacts from "./Contacts";

function Home() {
	const dispatch = useDispatch();
	const { data, isFetching, error } = useGetContactsQuery();
    const { wsData, wsIsFetching, wsError } = useWsConnectionQuery();

	useEffect(() => {
		if (error) {
			dispatch(
				setToast({
					type: "err",
					message: error,
				}),
			);
		}
	}, [error]);

    console.log(wsData, wsIsFetching, wsError);

	return isFetching ? (
		<div>
			<h3>Loading</h3>
		</div>
	) : (
		<div>
			<Contacts contacts={data}/>
		</div>
	);
}

export default Home;
