import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import url from "./url";

export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: url, // http://localhost:8080/api
		// prepareHeaders: (headers, { getState }) => {
		// 	const token = getState().user.token;

		// 	if (token) {
		// 		headers.set("Authorization", `Bearer ${token}`);
		// 	}
		// 	return headers;
		// },
		credentials: "include",
	}),
	endpoints: (builder) => ({
		// registerUser: builder.mutation({
		// 	query: (body) => ({
		// 		url: "/register",
		// 		method: "POST",
		// 		body,
		// 	}),
		// }),
		getContacts: builder.query({
			query: () => ({
				url: "/contacts",
			}),
		}),
		wsConnection: builder.query({
			queryFn: async () => {
				return { data: null };
			},
			async onCacheEntryAdded(
				arg,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				const ws = new WebSocket("ws://localhost:8080/api/ws");
				try {
					await cacheDataLoaded;

					const listener = (e) => {
						const data = JSON.parse(e.data);
						console.log(data);
						updateCachedData((draft) => {
							draft.push(data);
						});
					};
					let wsPinger;
					ws.addEventListener("open", () => {
						wsPinger = setInterval(() => {
							ws.send(
								JSON.stringify({
									type: "ping",
									from: 0,
									to: 0,
									message: "",
								}),
							);
						}, 60000);
					});
					ws.addEventListener("message", listener);
					ws.addEventListener("close", () => {
						console.log("Closing websocket");
						clearInterval(wsPinger);
						ws.removeEventListener("message", listener);
					});
					ws.addEventListener("error", () => {
						console.log("Websocket error");
						clearInterval(wsPinger);
					});
				} catch (err) {
					console.error(err);
				}
				await cacheEntryRemoved;
				// ws.close();

				// const socket = io(`${url}/ws`, {
				//     transports: ["websocket"]
				// })
			},
		}),
	}),
});

export const { useGetContactsQuery, useWsConnectionQuery } = api;

// async onQueryStarted(
// 	arg,
// 	{
// 		dispatch,
// 		getState,
// 		queryFulfilled,
// 		requestId,
// 		extra,
// 		getCacheEntry,
// 	},
// ) {},
