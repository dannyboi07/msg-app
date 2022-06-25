import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
	Box,
	StyledTabs,
	StyledContent,
	StyledList,
	StyledTrigger,
} from "../../stitches-components/menuStyled";
import {
	StyledInput,
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { styled } from "@stitches/react";
import { blackA, mauve } from "@radix-ui/colors";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { parseInitials } from "../../features/utils";
import { selectUser } from "../../slices/userSlice";

const StyledForm = styled("form", {
	height: "350px",
	display: "flex",
	flexDirection: "column",
	justifyContent: "space-around",

	"& > label > input": {
		height: 35,
        marginTop: "0.25em",
		padding: "0 0.5em",
		borderRadius: "0.25rem",
		border: 0,
		boxShadow: "0 0 0 1px gray",
        transition: "box-shadow 0.15s ease-in-out",

        "&:hover": {
            boxShadow: "0 0 0 1px black",
        },

		"&:focus": {
			outline: "none",
			boxShadow: "0 0 0 2px black",
		},
	},
});

const StyledProfPicChange = styled("div", {
	marginTop: "1em",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});

function ChangePw() {
	const theme = useSelector((state) => state.theme);
    const userDetails = useSelector(selectUser)

	const [changePw, setChangePw] = useState({
		// email: "",
		curPw: "",
		newPw: "",
		confirmPw: "",
	});

	const { lazyFetch } = useLazyAxios({
		url: "/changePw",
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		withCredentials: true,
		data: JSON.stringify({
			// email: changePw.email,
			password: changePw.curPw,
			new_pw: changePw.newPw,
		}),
	});

	function handleChange(e) {
		setChangePw({ ...changePw, [e.target.name]: e.target.value });
	};

	function handleSubmit(e) {
		e.preventDefault();
		lazyFetch();
	};

	const TabsTrigger = styled(StyledTrigger, {
		color: mauve.mauve11,
		"&:hover": {
			color: theme.contrast ? "black" : "white",
		},
		"&[data-state='active']": {
			color: theme.contrast ? "black" : "white",
			boxShadow: "inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor",
		},
		"&:focus": {
			position: "relative",
			boxShadow: `0 0 0 2px ${theme.contrast ? "black" : "white"}`,
		},
	});

	const Button = styled("button", {
		// height: 30,
		fontSize: "0.925rem",
		width: "fit-content",
		padding: "0.5em 1em",
		alignSelf: "center",
		borderRadius: "0.25rem",
		border: 0,
		backgroundColor: theme.contrast ? blackA.blackA8 : blackA.blackA12,
		color: theme.contrast ? "black" : "white",

		"&:hover": {
			cursor: "pointer",
			backgroundColor: blackA.blackA8,
		},
	});

	return (
		<StyledTabs defaultValue="tab1">
			<StyledList
				css={{
					borderBottom: `1px solid ${
						theme.contrast ? blackA.blackA12 : mauve.mauve6
					}`,
				}}
			>
				<TabsTrigger value="tab1">Profile Image</TabsTrigger>

				<TabsTrigger value="tab2">Password</TabsTrigger>
			</StyledList>

			<StyledContent value="tab1">
				<p
					style={{
						textAlign: "center",
					}}
				>
					Change your profile picture
				</p>
				<StyledProfPicChange>
					{userDetails && <Avatar
						css={{
							width: 275,
							height: 275,
						}}
					>
						<AvatarImage src={userDetails.profile_pic} alt={""} />
						<AvatarFallback
							css={{
								fontSize: "2rem",
							}}
							delayMs={500}
						>
							{parseInitials(userDetails.name)}
						</AvatarFallback>
					</Avatar>}
				</StyledProfPicChange>
			</StyledContent>

			<StyledContent value="tab2">
				<Box>
					<StyledForm onSubmit={handleSubmit}>
						{/* <label>
							Email:
							<StyledInput
								key="email"
								name="email"
								type="email"
								value={changePw.email}
								onChange={handleChange}
								required
							/>
						</label> */}
						<label>
							Current Password:
							<StyledInput
								key="curPw"
								name="curPw"
								type="password"
								value={changePw.curPw}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							New Password:
							<StyledInput
								key="newPw"
								name="newPw"
								type="password"
								value={changePw.newPw}
								onChange={handleChange}
								required
							/>
						</label>
						<label>
							Confirm Password:
							<StyledInput
								key="confirmPw"
								name="confirmPw"
								type="password"
								value={changePw.confirmPw}
								onChange={handleChange}
								required
							/>
						</label>
						<Button type="submit">Change Password</Button>
					</StyledForm>
				</Box>
			</StyledContent>
		</StyledTabs>
	);
}

export default ChangePw;
