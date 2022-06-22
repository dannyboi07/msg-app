import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAxios } from "../../hooks/useAxios";
import { addContact } from "../../slices/contactsSlice";
import { setActiveContact } from "../../slices/contactsSlice";
import {
	StyledContactList,
	StyledContact,
} from "../../stitches-components/homeStyled";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { parseInitials } from "../../features/utils";

function Contacts() {
	const dispatch = useDispatch();
	const { response, isLoading } = useAxios({
		method: "GET",
		url: "/contacts",
		withCredentials: true,
	});

	useEffect(() => {
		if (response) {
			dispatch(addContact(response));
		}
	}, [response]);

	console.log(response, isLoading);

	if (isLoading) {
		return (
			<div
				style={{
					width: "30%",
				}}
			>
				<h2>Loading...</h2>
			</div>
		);
	}
	return (
		<StyledContactList>
            <div>
                <h1>
                    Mumble
                </h1>
            </div>
			{response.map((contact) => {
				const nameInitials = parseInitials(contact.name);
				return (
					<StyledContact
						key={contact.user_id}
						onClick={() =>
							dispatch(setActiveContact(contact.user_id))
						}
					>
						<Avatar
							css={{
								width: 55,
								height: 55,
								margin: "0 0.75em 0 0.75em",
							}}
						>
							<AvatarImage
								src={contact.profile_pic}
								alt={contact.name}
							/>
							<AvatarFallback delayMs={0}>
								{nameInitials}
							</AvatarFallback>
						</Avatar>
						<div>
							<p>{contact.name}</p>
						</div>
					</StyledContact>
				);
			})}
		</StyledContactList>
	);
}

export default Contacts;
