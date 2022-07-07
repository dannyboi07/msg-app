import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setToast } from "../slices/toastSlice";

export const axiosInstance = axios.create({
	baseURL: "http://localhost:8080/api",
});

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		if (
			error.response.status === 401 &&
			(error.response.data === "Missing access token\n" ||
				error.response.data === "Token expired\n")
		) {
			await axiosInstance.get("/auth/refresh_token", {
				withCredentials: true,
			});
			return axiosInstance.request(error.config);
		}
		return Promise.reject(error);
	},
);

export function useAxios(axiosParams) {
	const dispatch = useDispatch();
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	async function fetchData(params) {
		try {
			const res = await axiosInstance.request(params);
			setResponse(res.data);
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

	useEffect(() => {
		setIsLoading(true);
		fetchData(axiosParams);
	}, []);

	return { response, isLoading, error };
}
