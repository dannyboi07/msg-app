import React, { useState } from "react";
import { styled } from "@stitches/react";
import { LoginBg, LoginForm } from "../../stitches-components/loginStyled";
import {
	StyledInput as Input,
	StyledButton as Button,
} from "../../stitches-components/commonStyled";
import { useDispatch } from "react-redux";
import url from "../../api/url";
import { setUser } from "../../slices/userSlice";
import { setToast } from "../../slices/toastSlice";

// const Input = styled(StyledInput, {
//     "&::before": {

//     }
// })

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
							"mumble-user",
							JSON.stringify(resJson),
						);
                        dispatch(setToast({
                            type: "suc",
                            title: "Logged in"
                        }))
					});
				} else {
					response.text().then((resText) =>
						dispatch(
							setToast({
								type: "err",
								title: resText,
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
                        variant="email"
						name="email"
						type="email"
						value={userDetails.email}
						onChange={handleDetailChange}
                        required
					/>
				</label>
				<label>
					Password:
					<Input
						name="password"
						type="password"
						value={userDetails.password}
						onChange={handleDetailChange}
                        required
					/>
				</label>

				<Button type="submit">Login</Button>
			</LoginForm>
		</LoginBg>
	);
}

export default Login;
