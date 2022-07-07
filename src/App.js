import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { StyledApp } from "./stitches-components/appStyled";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import { useDispatch } from "react-redux";
import { setToast } from "./slices/toastSlice";
import { ToastProvider } from "./stitches-components/toastStyled";
import ToastComp from "./components/Toast/ToastComp";
import "./App.css";
import AuthRouter from "./components/AuthRouter";
import UnAuthRouter from "./components/UnAuthRouter";
import Home from "./components/Home/Home";

function App() {
	const dispatch = useDispatch();

	return (
		<ToastProvider swipeDirection="right">
			<StyledApp>
				{/* <button
					onClick={() =>
						dispatch(
							setToast({
								type: "info",
								message: "Testing",
							}),
						)
					}
				>
					Set Toast
				</button> */}
				<Router>
					<Routes>
						<Route path="/auth" element={<UnAuthRouter />}>
							<Route
								path="/auth/register"
								element={<Register />}
							/>
							<Route path="/auth/login" element={<Login />} />
						</Route>
						<Route path="/" element={<AuthRouter />}>
							<Route path="/" element={<Home />} />
							{/* <Route
								path="/*"
								element={<Navigate to="/" replace />}
							/> */}
						</Route>
					</Routes>
				</Router>
			</StyledApp>
			<ToastComp />
		</ToastProvider>
	);
}

export default App;

{
	/* 
<div className="App">
			
		</div>
<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<Counter />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<span>
					<span>Learn </span>
					<a
						className="App-link"
						href="https://reactjs.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						React
					</a>
					<span>, </span>
					<a
						className="App-link"
						href="https://redux.js.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Redux
					</a>
					<span>, </span>
					<a
						className="App-link"
						href="https://redux-toolkit.js.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Redux Toolkit
					</a>
					,<span> and </span>
					<a
						className="App-link"
						href="https://react-redux.js.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						React Redux
					</a>
				</span>
			</header> */
}
