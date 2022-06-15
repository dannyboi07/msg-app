import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../slices/userSlice";
import { Navigate, Outlet } from "react-router-dom";

function AuthRouter({ children }) {
	const user = useSelector(selectUser);

    if (user) {
        return (
            <>
                {
                    children
                }
                <Outlet />
            </>
        )
    }

    return (
        <Navigate to="/auth/login" replace={true}/>
	);
}

export default AuthRouter;
