import { useState } from "react";
import { axiosInstance } from "./useAxios";
import { useDispatch } from "react-redux";
import { setToast } from "../slices/toastSlice";

// axios.defaults.baseURL = "http://localhost:8080/api";

export function useLazyAxios(axiosParams) {
    const dispatch = useDispatch();
    // Backend sends null when paginated queries have nothing more to return
    // Taking adv of undefined to diff between null sent by server and null set on client
	const [response, setResponse] = useState(undefined);
	const [isLoading, setIsLoading] = useState(true); 
	const [error, setError] = useState(null);

	async function fetchData(params) {
		setIsLoading(true);
		setError(null);
		try {
			const res = await axiosInstance.request(params);
			if (res !== undefined) {
				setResponse(res.data);
			}
		} catch (error) {
			setError(error.response.data);
			dispatch(
				setToast({
					type: "err",
					title: error.response.data,
				}),
			);
		} finally {
			setIsLoading(false);
		}
	}

	function lazyFetch() {
		// console.log(axiosParams)
		fetchData(axiosParams);
	}

	return { lazyFetch, response, isLoading, error };
}
