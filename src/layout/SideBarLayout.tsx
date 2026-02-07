import React from "react";
import SideBar from "../components/SideBar";

interface SideBarLayoutProps {
  children: React.ReactNode;
}

const SideBarLayout: React.FC<SideBarLayoutProps> = ({ children }) => {
  return (
    <div className="flex">
      <SideBar />
      {children}
    </div>
  );
};

export default SideBarLayout;
