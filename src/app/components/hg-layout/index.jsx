"use client";
import React from "react";
import { useState } from "react";
import Header from "../header";
import Footer from "../footer";

import Sidebar from "../sidebar";

import "./layout-styles.css";

const PageLayout = ({ header, footer, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        className="bg-gray-200 p-4"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {header}
      </Header>
      <div className="body-container flex flex-grow">
      <Sidebar isOpen={isSidebarOpen} />
 
        <main className="flex-grow bg-gray-100 p-4">{children}</main>
      </div>
      <Footer className="bg-gray-200 p-4">{footer}</Footer>
    </div>
  );
};

export default PageLayout;
