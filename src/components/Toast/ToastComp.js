import React from "react";
import {
	ToastViewport,
	Toast,
	ToastTitle,
	ToastDescription,
	ToastAction,
} from "../../stitches-components/toastStyled";
import { useSelector, useDispatch } from "react-redux";
import { selectToast, clearToast } from "../../slices/toastSlice";

function ToastComp() {
	const dispatch = useDispatch();
	const toast = useSelector(selectToast);
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

	return (
		<>
			<Toast
				duration={3000}
				open={toast.message}
				onOpenChange={() => dispatch(clearToast())}
			>
				<ToastTitle>
					{toast.type === "info" || toast.type === "err"
						? toast.message
						: toast.title}
				</ToastTitle>
				{toast.type !== "info" &&
					(toast.type !== "err" && (
						<ToastDescription asChild>
							<p>{toast.message}</p>
						</ToastDescription>
					))}
				<ToastAction asChild altText="Undo">
					<button>Undo</button>
				</ToastAction>
			</Toast>
			<ToastViewport />
		</>
	);
}

export default ToastComp;
