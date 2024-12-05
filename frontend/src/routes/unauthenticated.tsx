import { Navigate } from "react-router-dom";
import { Login, Signup } from "~/features/core";

export const unauthenticatedRoutes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
];
