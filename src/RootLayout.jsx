import { Outlet } from "react-router";
import "./App.css";

function RootLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default RootLayout;
