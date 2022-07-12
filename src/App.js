import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { StyledApp } from "./stitches-components/appStyled";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import { useDispatch } from "react-redux";
import { ToastProvider } from "./stitches-components/toastStyled";
import ToastComp from "./components/Toast/ToastComp";
import "./App.css";
import AuthRouter from "./components/AuthRouter";
import UnAuthRouter from "./components/UnAuthRouter";
import Home from "./components/Home/Home";

function App() {
	const dispatch = useDispatch();
    const [remountKey, setRemountKey] = useState(0);

    console.log(remountKey)

	return (
		<ToastProvider swipeDirection="right">
			<StyledApp>
				<Routes>
					<Route path="/auth" element={<UnAuthRouter />}>
						<Route path="/auth/register" element={<Register />} />
						<Route path="/auth/login" element={<Login />} />
					</Route>
					<Route path="/" element={<AuthRouter />}>
						<Route path="/" element={<Home remountKey={remountKey} />} />
						{/* <Route
								path="/*"
								element={<Navigate to="/" replace />}
							/> */}
					</Route>
				</Routes>
			</StyledApp>
			<ToastComp setRemountKey={setRemountKey}/>
		</ToastProvider>
	);
}

export default App;