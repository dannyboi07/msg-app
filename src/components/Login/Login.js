import React, { useState } from "react";
import { LoginBg, LoginForm } from "../../stitches-components/loginStyled";
import {
	StyledInput as Input,
	StyledButton as Button,
} from "../../stitches-components/commonStyled";
import { useDispatch } from "react-redux";
import url from "../../api/url";
import { setUser } from "../../slices/userSlice";
import { setToast } from "../../slices/toastSlice";

function Login() {
	const dispatch = useDispatch();
	const [userDetails, setUserDetails] = useState({
		email: "",
		password: "",
	});

	function handleDetailChange(e) {
		setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
	}

	function handleSubmit(e) {
		e.preventDefault();

		if (
			userDetails.email.trim() !== "" &&
			userDetails.password.trim() !== ""
		) {
            // const user_tz = Intl.DateTimeFormat().resolvedOptions().timeZone
			fetch(`${url}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
                credentials: "include",
				body: JSON.stringify({
					email: userDetails.email,
					password: userDetails.password,
                    // user_tz
				}),
			}).then((response) => {
				if (response.status === 200) {
					response.json().then((resJson) => {
						dispatch(setUser(resJson));
						localStorage.setItem(
							"msg-app-user-details",
							JSON.stringify(resJson),
						);
                        dispatch(setToast({
                            type: "info",
                            message: "Logged in"
                        }))
					});
				} else {
					response.text().then((resText) =>
						dispatch(
							setToast({
								type: "err",
								message: resText,
							}),
						),
					);
				}
			});
			// .then((data) => data.json())
			// .then((data) => console.log(data));
		}
	}

	return (
		<LoginBg>
			<h1>Login</h1>
			<LoginForm onSubmit={handleSubmit}>
				<label>
					Email:
					<Input
						name="email"
						type="email"
						value={userDetails.email}
						onChange={handleDetailChange}
					/>
				</label>
				<label>
					Password:
					<Input
						name="password"
						type="password"
						value={userDetails.password}
						onChange={handleDetailChange}
					/>
				</label>

				<Button type="submit">Login</Button>
			</LoginForm>
		</LoginBg>
	);
}

export default Login;
