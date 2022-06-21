import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setToast } from "../slices/toastSlice";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080/api";

export function useAxios(axiosParams) {
	const dispatch = useDispatch();
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	async function fetchData(params) {
		try {
			const res = await axios.request(params);
			setResponse(res.data);
		} catch (error) {
			setError(error.response.data);
			dispatch(
				setToast({
					type: "err",
					message: error.response.data,
				}),
			);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		setIsLoading(true);
		fetchData(axiosParams);
	}, []);

	return { response, isLoading, error };
}
