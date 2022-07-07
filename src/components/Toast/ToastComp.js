import React from "react";
import {
	StyledToast,
	ToastViewport,
	ToastTitle,
	ToastDescription,
	ToastAction,
} from "../../stitches-components/toastStyled";
import { useSelector, useDispatch } from "react-redux";
import { selectToast, setToast, clearToast } from "../../slices/toastSlice";
import { selectTheme } from "../../slices/themeSlice";
// import { theme } from "../../features/utils";
import { styled } from "@stitches/react";
import { Box } from "../../stitches-components/menuStyled";
// import { Avatar } from "@radix-ui/react-avatar";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "../../stitches-components/commonStyled";
import { parseInitials } from "../../features/utils";

function ToastComp() {
	const dispatch = useDispatch();
	const toast = useSelector(selectToast);
	const theme = useSelector(selectTheme);

	// React.useEffect(() => {
	// 	dispatch(
	// 		setToast({
	// 			type: "message",
	// 			message: "Test toast message",
	// 			contactDetails: {
	// 				profile_pic:
	// 					"http://localhost:8080/static/public/profile-pics/2022-06-15-20-13-58-2772209162.jpg",
	// 				name: "Anon Test",
	// 			},
	// 		}),
	// 	);
	// }, []);

	const Toast = styled(StyledToast, {
		backgroundColor: theme.accCol,
		color: theme.contrast ? "white" : "black",
	});

	return (
		<>
			<Toast
				className={`${toast && toast.type}`}
				duration={3000}
				open={true}
				onOpenChange={() => dispatch(clearToast())}
			>
				{toast && (
					<>
						<Box className={`graphic-ctn ${toast.type}`}>
							{toast.type === "info" ? (
								<svg
									width="25"
									height="25"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
							) : toast.type === "message" ? (
								<Avatar
									css={{
										width: 50,
										height: 50,
									}}
								>
									<AvatarImage
										src={toast.contactDetails.profile_pic}
									/>
									<AvatarFallback delayMs={0}>
										{parseInitials(
											toast.contactDetails.name,
										)}
									</AvatarFallback>
								</Avatar>
							) : toast.type === "suc" ? (
								<svg
									width="25"
									height="25"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.49991 0.877045C3.84222 0.877045 0.877075 3.84219 0.877075 7.49988C0.877075 11.1575 3.84222 14.1227 7.49991 14.1227C11.1576 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1576 0.877045 7.49991 0.877045ZM1.82708 7.49988C1.82708 4.36686 4.36689 1.82704 7.49991 1.82704C10.6329 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6329 13.1727 7.49991 13.1727C4.36689 13.1727 1.82708 10.6329 1.82708 7.49988ZM10.1589 5.53774C10.3178 5.31191 10.2636 5.00001 10.0378 4.84109C9.81194 4.68217 9.50004 4.73642 9.34112 4.96225L6.51977 8.97154L5.35681 7.78706C5.16334 7.59002 4.84677 7.58711 4.64973 7.78058C4.45268 7.97404 4.44978 8.29061 4.64325 8.48765L6.22658 10.1003C6.33054 10.2062 6.47617 10.2604 6.62407 10.2483C6.77197 10.2363 6.90686 10.1591 6.99226 10.0377L10.1589 5.53774Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
							) : (
								// Error svg
								<svg
									width="25"
									height="25"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M0.877075 7.49988C0.877075 3.84219 3.84222 0.877045 7.49991 0.877045C11.1576 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49991 1.82704C4.36689 1.82704 1.82708 4.36686 1.82708 7.49988C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988C13.1727 4.36686 10.6329 1.82704 7.49991 1.82704ZM9.85358 5.14644C10.0488 5.3417 10.0488 5.65829 9.85358 5.85355L8.20713 7.49999L9.85358 9.14644C10.0488 9.3417 10.0488 9.65829 9.85358 9.85355C9.65832 10.0488 9.34173 10.0488 9.14647 9.85355L7.50002 8.2071L5.85358 9.85355C5.65832 10.0488 5.34173 10.0488 5.14647 9.85355C4.95121 9.65829 4.95121 9.3417 5.14647 9.14644L6.79292 7.49999L5.14647 5.85355C4.95121 5.65829 4.95121 5.3417 5.14647 5.14644C5.34173 4.95118 5.65832 4.95118 5.85358 5.14644L7.50002 6.79289L9.14647 5.14644C9.34173 4.95118 9.65832 4.95118 9.85358 5.14644Z"
										fill="currentColor"
										fillRule="evenodd"
										clipRule="evenodd"
									></path>
								</svg>
							)}
						</Box>

						<div className="text-ctn">
							<ToastTitle>
								{toast.type === "info" ||
								toast.type === "err" ||
								toast.type === "suc"
									? toast.title
									: toast.contactDetails.name}
							</ToastTitle>
							{(toast.type === "info" ||
								toast.type === "message") &&
								toast.type !== "err" && (
									<ToastDescription asChild>
										<p>{toast.message}</p>
									</ToastDescription>
								)}
						</div>
						{/* <ToastAction asChild altText="Undo">
							<button>Undo</button>
						</ToastAction> */}
					</>
				)}
			</Toast>
			<ToastViewport />
		</>
	);
}

export default ToastComp;

// const toastTimer = useRef(0);
// console.log(toast);
// useEffect(() => {
// 	if (toast.message) {
// 		toastTimer.current = setTimeout(() => {
// 			dispatch(clearToast());
// 		}, 3000);
// 	}
// 	return () => clearTimeout(toastTimer.current);
// }, [toast.message]);
