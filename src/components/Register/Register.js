import React, { useState, useEffect, useRef } from "react";
import {
	RegisterBg,
	RegisterForm,
} from "../../stitches-components/registerStyled";
import {
	StyledInput as Input,
	StyledButton as Button,
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
// import { useRegisterUserMutation } from "../../api/apiSlice";
import url from "../../api/url";
import { useDispatch } from "react-redux";
import { setToast } from "../../slices/toastSlice";

function Register() {
	const dispatch = useDispatch();
	const [userDetails, setUserDetails] = useState({
		profilePic: null,
		name: "",
		email: "",
		password: "",
	});
	const [profPicUrl, setProfPicUrl] = useState(null);
	const [fallbackName, setFallbackName] = useState("");
	const profilePicInp = useRef(null);
	// const [registerUser, { isLoading, isSuccess, error, isError }] =
	// 	useRegisterUserMutation();

	function handleDetailChange(e) {
		// switch (e.target.name) {
		// 	case "name" && typeof(e.target.value) === "string":
		// 		const nameSplit = e.target.value.split(" ");
		// 		let nameInitials = "";
		// 		nameSplit.forEach((namePart) => {
		// 			if (namePart[0]) {
		// 				nameInitials += namePart[0];
		// 			}
		// 		});
		// 		setFallbackName(nameInitials);
		// 		break;
		// 	case "profilePic":
		// 		setUserDetails({
		// 			...userDetails,
		// 			[e.target.name]: e.target.files[0],
		// 		});
		// 		break;
		// 	default:
		// 		setUserDetails({
		// 			...userDetails,
		// 			[e.target.name]: e.target.value,
		// 		});
		// 		break;
		// }
		if (e.target.name === "name" && typeof e.target.value === "string") {
			const nameSplit = e.target.value.split(" ");
			let nameInitials = "";
			nameSplit.forEach((namePart) => {
				if (namePart[0]) {
					nameInitials += namePart[0];
				}
			});
			setFallbackName(nameInitials);
			setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
		} else if (e.target.name === "profilePic") {
			setUserDetails({
				...userDetails,
				[e.target.name]: e.target.files[0],
			});
		} else {
			setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
		}
	}

	function handleSubmit(e) {
		e.preventDefault();

		if (
			userDetails.name.trim().length === 0 ||
			userDetails.email.trim() === 0 ||
			userDetails.password.trim() === 0
		) {
			window.alert("Credentials can't be empty");
			return;
		}
		const regForm = new FormData();
		regForm.append("name", userDetails.name);
		regForm.append("email", userDetails.email);
		regForm.append("password", userDetails.password);
		if (userDetails.profilePic) {
			const imgFileName = profilePicInp.current.value;
			const dotIdx = imgFileName.lastIndexOf(".") + 1;
			const fileExt = imgFileName
				.substring(dotIdx, imgFileName.length)
				.toLowerCase();
			if (!/^jpg|jpeg|png|heif|heic|gif$/.test(fileExt)) {
				window.alert("Profile picture format is inacceptable", fileExt);
                console.log(fileExt)
				dispatch(
					setToast({
						type: "err",
						message: "Picture format is unacceptable",
					}),
				);
				return;
			}
			regForm.append("profilePic", userDetails.profilePic);
		}
		// registerUser(regForm);
		fetch(`${url}/register`, {
			method: "POST",
			body: regForm,
		})
			.then((data) => {
				if (data.status !== 200) {
					data.text().then((message) =>
						dispatch(
							setToast({
								type: "err",
								message,
							}),
						),
					);
				}
			})
			.catch((err) => console.error(err));
	}

	useEffect(() => {
		URL.revokeObjectURL(profPicUrl);
		if (userDetails.profilePic) {
			setProfPicUrl(URL.createObjectURL(userDetails.profilePic));
		} else if (!userDetails.profilePic) {
			setProfPicUrl(null);
		}
		return () => {
			if (profPicUrl) URL.revokeObjectURL(profPicUrl);
		};
	}, [userDetails.profilePic]);

	return (
		<RegisterBg>
			<h1>Register</h1>
			<RegisterForm onSubmit={handleSubmit} encType="multipart/form-data">
				<div>
					<h3>
						Profile Picture <span>(Click below to upload)</span>
					</h3>
					<Avatar>
						<AvatarImage src={profPicUrl} alt={userDetails.name} />
						<AvatarFallback delayMs={500}>
							{fallbackName}
						</AvatarFallback>
					</Avatar>
					<label>
						<input
							name="profilePic"
							type="file"
							onChange={handleDetailChange}
							ref={profilePicInp}
						/>
					</label>
				</div>
				<label>
					Name:
					<Input
						name="name"
						type="text"
						value={userDetails.name}
						onChange={handleDetailChange}
						required
					/>
				</label>
				<label>
					Email:
					<Input
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

				<Button type="submit">Register</Button>
			</RegisterForm>
		</RegisterBg>
	);
}

export default Register;
