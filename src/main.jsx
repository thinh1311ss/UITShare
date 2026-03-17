import { createRoot } from "react-dom/client";
import "./index.css";
import RootLayout from "./RootLayout.jsx";
import HomePage from "./pages/Homepage/HomePage.jsx";
import DocumentDetail from "./pages/DocumentDetail/DocumentDetail.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import Admin from "./pages/Admin/Admin.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/Document/:id",
        element: <DocumentDetail />,
      },
      {
        path: "Login",
        element: <Login />,
      },
      {
        path: "Register",
        element: <Register />,
      },
      {
        path: "forgotPassword",
        element: <ForgotPassword />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
