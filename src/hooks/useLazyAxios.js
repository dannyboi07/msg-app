import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToast } from "../slices/toastSlice";

axios.defaults.baseURL = "http://localhost:8080/api";

export function useLazyAxios(axiosParams) {
	const dispatch = useDispatch();
	const [response, setResponse] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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

    function lazyFetch() {
        fetchData(axiosParams)
    }

    return { lazyFetch, response, isLoading, error }
}
