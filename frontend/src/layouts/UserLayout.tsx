import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/user/components/header/Header";
import Footer from "@/user/components/footer/Footer";

const UserLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default UserLayout;
