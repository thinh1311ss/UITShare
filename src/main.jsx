import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import RootLayout from "./RootLayout.jsx";
import App from "./App.jsx";
import Home from "./pages/Home/Home.jsx";
import DocumentDetail from "./pages/DocumentDetail/DocumentDetail.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/document/:id",
        element: <DocumentDetail />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);