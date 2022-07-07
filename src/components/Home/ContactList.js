import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	selectActiveContact,
	selectPendingMsgs,
} from "../../slices/contactsSlice";
import { selectTheme } from "../../slices/themeSlice";
import { styled } from "@stitches/react";
import { blackA, whiteA } from "@radix-ui/colors";
import { StyledContact } from "../../stitches-components/homeStyled";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { setToast } from "../../slices/toastSlice";

function Contact({
	onClick,
	contactId,
	contactName,
	nameInitials,
	contactProfPic,
}) {
    const dispatch = useDispatch();
	const theme = useSelector(selectTheme);
	const activeContactId = useSelector(selectActiveContact);
	const contactPendingMsgs = useSelector(selectPendingMsgs(contactId));

	const SContact = styled(StyledContact, {
		color: theme.contrast ? "black" : "white",

		"&:hover": {
			cursor: contactId === activeContactId ? "default" : "pointer",
			pointerEvents: contactId === activeContactId ? "none" : "initial",
			backdropFilter:
				contactId === activeContactId ? "none" : "contrast(70%)",
		},

		"&::after": {
			backgroundColor: `${theme.accCol}`,
		},

		"& > div > div:first-child > div.pndng-msg-ctn > p.pndng-msg": {
			color: theme.contrast ? blackA.blackA11 : whiteA.whiteA11,
		},
	});

    useEffect(() => {
        if (contactPendingMsgs.count > 0) {
            dispatch(setToast({
                type: "message",
                message: contactPendingMsgs.text,
                contactDetails: {
                    name: contactName,
                    profile_pic: contactProfPic,
                }
            }))
        };

    }, [contactPendingMsgs])

	return (
		<SContact onClick={onClick}>
			<Avatar
				css={{
					width: 55,
					height: 55,
					minWidth: 55,
					minHeight: 55,
					margin: "0 0.75em 0 0.75em",
				}}
			>
				<AvatarImage src={contactProfPic} alt={contactName} />
				<AvatarFallback delayMs={0}>{nameInitials}</AvatarFallback>
			</Avatar>

			<div>
				<div>
					<p className="contact-name">{contactName}</p>
					{contactPendingMsgs && contactPendingMsgs.count > 0 && (
						<div className="pndng-msg-ctn">
							<p className="pndng-msg">
								{contactPendingMsgs.text}
							</p>
						</div>
					)}
				</div>
				{contactPendingMsgs && contactPendingMsgs.count > 0 && (
					<div className="pndng-count">
						{contactPendingMsgs.count}
					</div>
				)}
			</div>
		</SContact>
	);
}

export default Contact;
