import React from "react";
import { Contact } from "../../stitches-components/homeStyled";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "../../stitches-components/commonStyled";

function Contacts({ contacts }) {
	return (
		<div>
			{contacts.map((contact) => {
				const splitName = contact.name.split(" ");
				let nameInitials = "";
				for (let i = 0; i < splitName.length; i++) {
					if (i === 2) {
						break;
					} else if (splitName[i][0]) {
						nameInitials += splitName[i][0];
					}
				}
				return (
					<Contact key={contact.user_id}>
						<Avatar>
							<AvatarImage
								src={contact.profile_pic}
								alt={contact.name}
							/>
							<AvatarFallback delayMs={0}>
								{nameInitials}
							</AvatarFallback>
						</Avatar>
                        <div>
                            <h3>
                                {
                                    contact.name
                                }
                            </h3>
                        </div>
					</Contact>
				);
			})}
		</div>
	);
}

export default Contacts;
