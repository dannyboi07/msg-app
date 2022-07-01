import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAxios } from "../../hooks/useAxios";
import { addContact, clearPendingMsgs, updatePendingMsgs } from "../../slices/contactsSlice";
import { setActiveContact } from "../../slices/contactsSlice";
import { selectTheme } from "../../slices/themeSlice";
import {
	StyledContactList,
	StyledContact,
} from "../../stitches-components/homeStyled";
import Contact from "./ContactList";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { parseInitials } from "../../features/utils";
import DropMenu from "./DropMenu";

function Contacts() {
	const dispatch = useDispatch();
	const theme = useSelector(selectTheme);
	const { response, isLoading } = useAxios({
		method: "GET",
		url: "/contacts",
		withCredentials: true,
	});

	useEffect(() => {
		if (response) {
			const parsedResponse = response.map((contact) => {
				return {
					...contact,
					message: {
						text: "",
						count: 0,
					},
				};
			});
			dispatch(addContact(parsedResponse));
		}
	}, [response]);

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
		<StyledContactList
			css={{
				backgroundColor: theme.primCol,
			}}
		>
			<div>
				<h1
					style={{
						color: theme.accCol,
					}}
				>
					Mumble
				</h1>
				<DropMenu />
			</div>
			<hr />
			{response &&
				response.map((contact) => {
					const nameInitials = parseInitials(contact.name);
					return (
						<Contact
							key={contact.user_id}
							contactId={contact.user_id}
							contactName={contact.name}
                            nameInitials={nameInitials}
							contactProfPic={contact.profile_pic}
							onClick={() =>
								{dispatch(setActiveContact(contact.user_id))
                                dispatch(clearPendingMsgs(contact.user_id))}
							}
						/>
					);
				})}
            <button onClick={() => dispatch(updatePendingMsgs({
                contactId: 13,
                text: "kjaskldjfkljalksjdfkalksjdfkjaksfdalsdfkasjldfj kasjd flas  flas df"
            }))}>
                Dispatch
            </button>
		</StyledContactList>
	);
}

export default Contacts;
