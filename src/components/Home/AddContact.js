import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addContact } from "../../slices/contactsSlice";
import {
	StyledInput,
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { Box } from "../../stitches-components/menuStyled";
import { styled } from "@stitches/react";
import { blackA } from "@radix-ui/colors";
import { useLazyAxios } from "../../hooks/useLazyAxios";
import { parseInitials } from "../../features/utils";

const Input = styled(StyledInput, {
	height: 35,
	// marginTop: "0.25em",
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
});

function AddContact() {
	const dispatch = useDispatch();
	const theme = useSelector((state) => state.theme);
	const [email, setEmail] = useState("");
	const { lazyFetch: fetchUser, response: findUserResponse } = useLazyAxios({
		url: `/searchUser?email=${email}`,
		method: "GET",
		// data: {},
		withCredentials: true,
	});

	const {
		lazyFetch: addContact,
		response: addContactResponse,
		error: addContactError,
	} = useLazyAxios({
		url: `/addContact`,
		method: "POST",
		data:
			findUserResponse &&
			JSON.stringify({
				user_id: findUserResponse.user_id,
			}),
		withCredentials: true,
	});

	const Button = styled("button", {
		// height: 30,
		fontSize: "0.925rem",
		minWidth: "fit-content",
        height: 35,
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

	function handleAddContact() {
		// e.preventDefault();
		addContact();
	}

	useEffect(() => {
		if (addContactResponse && !addContactError) {
			dispatch(
				addContact({
					user_id: findUserResponse.user_id,
					name: findUserResponse.name,
					profile_pic: findUserResponse.profile_pic,
				}),
			);
		}
	}, [addContactResponse, addContactError]);

	return (
		<Box
			css={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Box css={{
                display: "flex",
                width: "100%",
                alignItems: "center"
            }}>
				<Input
					name="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							fetchUser();
						}
					}}
					placeholder="Email...Press enter to search"
					required
				/>
				<Button onClick={handleAddContact}>Add Contact</Button>
			</Box>
			{findUserResponse && (
				<Avatar
					css={{
						width: 350,
						height: 350,
						margin: "1em 0",
					}}
				>
					<AvatarImage src={findUserResponse.profile_pic} />
					<AvatarFallback delayMs={500}>
						{parseInitials(findUserResponse.name)}
					</AvatarFallback>
				</Avatar>
			)}
			{findUserResponse && (
				<p
					style={{
						fontSize: "2rem",
						marginBottom: "0.5em",
					}}
				>
					{findUserResponse.name}
				</p>
			)}
		</Box>
	);
}

export default AddContact;
