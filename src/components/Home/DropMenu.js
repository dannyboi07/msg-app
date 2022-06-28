import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../slices/userSlice";
import {
    DropdownMenuArrow,
	DropdownMenuCheckboxItem,
	// DropdownMenuItem,
	DropdownMenuItemIndicator,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTriggerItem,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	StyledItem,
	StyledDialogContent,
	StyledDialogTitle,
	StyledDialogDescription,
	StyledDialog,
	StyledDialogClose,
	StyledDialogTrigger,
	StyledDialogPortal,
	StyledDialogOverlay,
} from "../../stitches-components/homeStyled";
import {
	RadioGroup,
	StyledRadio,
	StyledIndicator,
	Box,
} from "../../stitches-components/menuStyled";
import { styled } from "@stitches/react";
import OptionsSvg from "../../assets/options.svg";
import { blackA } from "@radix-ui/colors";
import ThemeSettings from "./ThemeSettings";
import ChangePw from "./ChangePw";
import AddContact from "./AddContact";

function DropMenu() {
	const dispatch = useDispatch();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [addContactOpen, setAddContactOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const theme = useSelector((state) => state.theme);

	const DropdownMenuItem = styled(StyledItem, {
		color: theme.contrast ? "white" : "black",
		"&:focus": {
			backgroundColor: theme.primCol,
			color: theme.contrast ? "black" : "white",
		},
	});

	function logOut() {
		window.localStorage.removeItem("msg-app-user-details");
		dispatch(clearUser());
	}

	// React.useEffect(() => {
	// 	console.log(settingsOpen, dropdownOpen);
	// }, [settingsOpen, dropdownOpen]);

	return (
		<div>
			<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<img src={OptionsSvg} alt="options" />
				</DropdownMenuTrigger>

				<DropdownMenuContent
					css={{
						backgroundColor: theme.accCol,
					}}
					sideOffset={15}
					align="end"
					hidden={addContactOpen || settingsOpen}
				>
					<StyledDialog
						open={addContactOpen}
						onOpenChange={setAddContactOpen}
					>
						<StyledDialogTrigger asChild>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
							>
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
								Add contact
							</DropdownMenuItem>
						</StyledDialogTrigger>

						<StyledDialogPortal>
							<StyledDialogOverlay />
							<StyledDialogContent
								css={{
									backgroundColor: theme.primCol,
									color: theme.contrast ? "black" : "white",
								}}
							>
								<StyledDialogTitle>
									Add Contact
								</StyledDialogTitle>
								<StyledDialogDescription>
									Find your friends by email and send them a
									request
								</StyledDialogDescription>

								<AddContact />

								<StyledDialogClose
									css={{
										color: theme.contrast
											? "black"
											: "white",
									}}
									asChild
								>
									<button>
										<svg
											width="15"
											height="15"
											viewBox="0 0 15 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
												fill="currentColor"
												fillRule="evenodd"
												clipRule="evenodd"
											></path>
										</svg>
									</button>
								</StyledDialogClose>
							</StyledDialogContent>
						</StyledDialogPortal>
					</StyledDialog>

					<StyledDialog
						open={settingsOpen}
						onOpenChange={setSettingsOpen}
					>
						<StyledDialogTrigger asChild>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
							>
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.07095 0.650238C6.67391 0.650238 6.32977 0.925096 6.24198 1.31231L6.0039 2.36247C5.6249 2.47269 5.26335 2.62363 4.92436 2.81013L4.01335 2.23585C3.67748 2.02413 3.23978 2.07312 2.95903 2.35386L2.35294 2.95996C2.0722 3.2407 2.0232 3.6784 2.23493 4.01427L2.80942 4.92561C2.62307 5.2645 2.47227 5.62594 2.36216 6.00481L1.31209 6.24287C0.924883 6.33065 0.650024 6.6748 0.650024 7.07183V7.92897C0.650024 8.32601 0.924883 8.67015 1.31209 8.75794L2.36228 8.99603C2.47246 9.375 2.62335 9.73652 2.80979 10.0755L2.2354 10.9867C2.02367 11.3225 2.07267 11.7602 2.35341 12.041L2.95951 12.6471C3.24025 12.9278 3.67795 12.9768 4.01382 12.7651L4.92506 12.1907C5.26384 12.377 5.62516 12.5278 6.0039 12.6379L6.24198 13.6881C6.32977 14.0753 6.67391 14.3502 7.07095 14.3502H7.92809C8.32512 14.3502 8.66927 14.0753 8.75705 13.6881L8.99505 12.6383C9.37411 12.5282 9.73573 12.3773 10.0748 12.1909L10.986 12.7653C11.3218 12.977 11.7595 12.928 12.0403 12.6473L12.6464 12.0412C12.9271 11.7604 12.9761 11.3227 12.7644 10.9869L12.1902 10.076C12.3768 9.73688 12.5278 9.37515 12.638 8.99596L13.6879 8.75794C14.0751 8.67015 14.35 8.32601 14.35 7.92897V7.07183C14.35 6.6748 14.0751 6.33065 13.6879 6.24287L12.6381 6.00488C12.528 5.62578 12.3771 5.26414 12.1906 4.92507L12.7648 4.01407C12.9766 3.6782 12.9276 3.2405 12.6468 2.95975L12.0407 2.35366C11.76 2.07292 11.3223 2.02392 10.9864 2.23565L10.0755 2.80989C9.73622 2.62328 9.37437 2.47229 8.99505 2.36209L8.75705 1.31231C8.66927 0.925096 8.32512 0.650238 7.92809 0.650238H7.07095ZM4.92053 3.81251C5.44724 3.44339 6.05665 3.18424 6.71543 3.06839L7.07095 1.50024H7.92809L8.28355 3.06816C8.94267 3.18387 9.5524 3.44302 10.0794 3.81224L11.4397 2.9547L12.0458 3.56079L11.1882 4.92117C11.5573 5.44798 11.8164 6.0575 11.9321 6.71638L13.5 7.07183V7.92897L11.932 8.28444C11.8162 8.94342 11.557 9.55301 11.1878 10.0798L12.0453 11.4402L11.4392 12.0462L10.0787 11.1886C9.55192 11.5576 8.94241 11.8166 8.28355 11.9323L7.92809 13.5002H7.07095L6.71543 11.932C6.0569 11.8162 5.44772 11.5572 4.92116 11.1883L3.56055 12.046L2.95445 11.4399L3.81213 10.0794C3.4431 9.55266 3.18403 8.94326 3.06825 8.2845L1.50002 7.92897V7.07183L3.06818 6.71632C3.18388 6.05765 3.44283 5.44833 3.81171 4.92165L2.95398 3.561L3.56008 2.95491L4.92053 3.81251ZM9.02496 7.50008C9.02496 8.34226 8.34223 9.02499 7.50005 9.02499C6.65786 9.02499 5.97513 8.34226 5.97513 7.50008C5.97513 6.65789 6.65786 5.97516 7.50005 5.97516C8.34223 5.97516 9.02496 6.65789 9.02496 7.50008ZM9.92496 7.50008C9.92496 8.83932 8.83929 9.92499 7.50005 9.92499C6.1608 9.92499 5.07513 8.83932 5.07513 7.50008C5.07513 6.16084 6.1608 5.07516 7.50005 5.07516C8.83929 5.07516 9.92496 6.16084 9.92496 7.50008Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
								Settings
							</DropdownMenuItem>
						</StyledDialogTrigger>

						<StyledDialogPortal>
							<StyledDialogOverlay />
							<StyledDialogContent
								css={{
									backgroundColor: theme.primCol,
									color: theme.contrast ? "black" : "white",
									transition: "height 0.25s",
								}}
							>
								<StyledDialogTitle>Settings</StyledDialogTitle>
								<StyledDialogDescription>
									Change your theme, password.
								</StyledDialogDescription>

								<Box
									css={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-evenly",
										// border: "1px solid black"
									}}
								>
									<ThemeSettings />
									<ChangePw />
								</Box>

								<StyledDialogClose
									css={{
										color: theme.contrast
											? "black"
											: "white",
									}}
									asChild
								>
									<button>
										<svg
											width="15"
											height="15"
											viewBox="0 0 15 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
												fill="currentColor"
												fillRule="evenodd"
												clipRule="evenodd"
											></path>
										</svg>
									</button>
								</StyledDialogClose>
							</StyledDialogContent>
						</StyledDialogPortal>
					</StyledDialog>

					<DropdownMenuSeparator
						css={{
							backgroundColor: theme.primCol,
						}}
					/>
					<DropdownMenuItem onClick={logOut}>
						{/* <img src={LogoutSvg} alt="logout" /> */}
						<svg
							width="15"
							height="15"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z"
								fill="currentColor"
								fillRule="evenodd"
								clipRule="evenodd"
							></path>
						</svg>
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default DropMenu;

// const RadioGroupRadio = styled(StyledRadio, {
//     "&:hover": {
//         backgroundColor: theme.accCol,
//     }
// });

// const RadioGroupIndicator = styled(StyledIndicator, {
// 	"&::after": {
// 		backgroundColor: theme.accCol,
// 	},
// });

// const DialogClose = styled(StyledDialogClose, {
//     "&:hover": {
//         backgroundColor: blackA.blackA9,
//     },
//     "&:focus": {
//         boxShadow: `0 0 0 2px ${blackA.blackA9}`,
//     }
// })

{
	/* <Box
css={{
    display: "flex",
    // border: "1px solid black",
}}
>
<Box css={{
    width: "40%"
}}>
    <RadioGroup
        defaultValue={theme.type}
        aria-label="Choose your theme"
    >
        <Box
            css={{
                display: "flex",
                alignItems: "center",
                // justifyContent:
                // 	"space-between",
                // border: "1px solid black",
            }}
        >
            <StyledRadio
                css={{
                    marginRight: "0.75em"
                }}
                value="light"
                id="r1"
            >
                <RadioGroupIndicator />
            </StyledRadio>
            <label htmlFor="r1">
                Light
            </label>
        </Box>

        <Box
            css={{
                display: "flex",
                alignItems: "center",
                // justifyContent:
                // 	"space-between",
                margin: "0.5em 0"
            }}
        >
            <StyledRadio
                css={{
                    marginRight: "0.75em"
                }}
                value="dark"
                id="r2"
            >
                <RadioGroupIndicator />
            </StyledRadio>
            <label htmlFor="r2">Dark</label>
        </Box>

        <Box
            css={{
                display: "flex",
                alignItems: "center",
                // justifyContent:
                // 	"space-between",
            }}
        >
            <StyledRadio
                css={{
                    marginRight: "0.75em"
                }}
                value="custom"
                id="r3"
            >
                <RadioGroupIndicator />
            </StyledRadio>
            <label htmlFor="r3">
                My choice
            </label>
        </Box>
    </RadioGroup>
</Box>
</Box> */
}

// <StyledDialog>
// 							<StyledDialogTrigger asChild>
// 								<svg
// 									width="15"
// 									height="15"
// 									viewBox="0 0 15 15"
// 									fill="none"
// 									xmlns="http://www.w3.org/2000/svg"
// 								>
// 									<path
// 										d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
// 										fill="currentColor"
// 										fillRule="evenodd"
// 										clipRule="evenodd"
// 									></path>
// 								</svg>
// 								Add contact
// 							</StyledDialogTrigger>
//                             <SettingsDialog />
// 						</StyledDialog>
