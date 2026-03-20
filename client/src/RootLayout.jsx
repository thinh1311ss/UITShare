import { Outlet } from "react-router";
import "./App.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

function RootLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default RootLayout;
