import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { parseInitials } from "../../features/utils";
import { selectActiveContactDetails } from "../../slices/contactsSlice";
// import { useAxios } from "../../hooks/useAxios";
import { StyledChatProfile } from "../../stitches-components/chatStyled";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";
import { selectUserId } from "../../slices/userSlice";

function parseOnline(status) {
    console.log(status, new Date(status))
	if (status === "Online") return "Online";
	else {
		const statusDate = new Date(status);
		const statusTime = statusDate.toLocaleString("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		});

		const statusLocaleDateString = statusDate.toLocaleDateString();

		const currDate = new Date();
		// const currLocaleDateString = currDate.toLocaleDateString();
		if (
			statusDate.getMonth() === currDate.getMonth() &&
			statusDate.getFullYear() === currDate.getFullYear()
		) {
			if (statusDate.getDate() === currDate.getDate())
				return `Last seen today at ${statusTime}`;
			else if (statusDate.getDate() === currDate.getDate() - 1)
				return `Last seen yesterday at ${statusTime}`;
		}
		return `Last seen on ${statusLocaleDateString} at ${statusTime}`;
	}
}

function ChatProfile({ wsConn }) {
    const userId = useSelector(selectUserId);
	const contactDetails = useSelector(selectActiveContactDetails);
    const [lastSeen, setLastSeen] = useState("");
	// const contactDetails1 = useSelector(state => state.contacts.contacts.find(contact => contact.userId))

    useEffect(() => {
        function handleWsStatusListener(e) {
            const data = JSON.parse(e.data);
            if (data.last_seen) {
                setLastSeen(parseOnline(data.last_seen))
            }
        }
        wsConn.current.addEventListener("message", handleWsStatusListener)
        wsConn.current.send(JSON.stringify({
            type: "getstatus",
            from: userId,
            to: contactDetails.user_id
        }));
        wsConn.current.send(JSON.stringify({
            type: "sub",
            from: userId,
            to: contactDetails.user_id
        }))

        return(() => wsConn.current.removeEventListener("message", handleWsStatusListener))

    }, []);

	return (
		<StyledChatProfile>
			<Avatar
				css={{
					width: 50,
					height: 50,
					margin: "0 0.75em 0 1em",
				}}
			>
				<AvatarImage
					src={contactDetails.profile_pic}
					alt={contactDetails.name}
				/>
				<AvatarFallback delayMs={0}>
					{parseInitials(contactDetails.name)}
				</AvatarFallback>
			</Avatar>
			<div>
				<h3>{contactDetails.name}</h3>
				<p>{lastSeen !== "" && lastSeen}</p>
			</div>
		</StyledChatProfile>
	);
}

export default ChatProfile;

// console.log(contactDetails, response);
// const nameInitials = parseInitials(contactDetails.name);
// const lastSeen = parseOnline(response);
