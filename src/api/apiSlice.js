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
			queryFn: () => {
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
					ws.addEventListener("message", listener);
					ws.onopen(
						(wsPinger = setInterval(() => {
							ws.send(
								JSON.stringify({
									type: "ping",
									from: 0,
									to: 0,
									message: "",
								}),
							);
						}, 30000)),
					);
					ws.onclose(() => {
                        console.log("Closing websocket")
                        clearInterval(wsPinger)
						ws.removeEventListener("message", listener);
					});
				} catch (err) {
					console.error(err);
				}
				await cacheEntryRemoved;
				ws.close();

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
