"use client";
import React from "react";
import { useState } from "react";
import Header from "../header";
import Footer from "../footer";

import Sidebar from "../sidebar";
import Pick from "../widgets/pick";
import Leaderboard from "../widgets/leaderboard";
import Scoresheet from "../widgets/scoresheet";

import WidgetContainer from "../widget-container";

import "./layout-styles.css";

const PageLayout = ({ header, footer, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderChildren = () => {
    if (React.Children.count(children) === 0) {
      return (
        <>
          <WidgetContainer title={"Your Pick"}>
            <Pick
              hasMadePick={true}
              pick={"Sam Burns"}
              onChangePick={setIsSidebarOpen}
            />
          </WidgetContainer>
          <WidgetContainer title="League Leaderboard">
            <Leaderboard />
          </WidgetContainer>
          <WidgetContainer title="Make a Pick">
            <Pick
              hasMadePick={false}
              pick={""}
              onChangePick={setIsSidebarOpen}
            />
          </WidgetContainer>

          <WidgetContainer title="Scoring Rules">
          <Scoresheet/>

          </WidgetContainer>
        </>
      );
    }

    return React.Children.map(children, (child) => (
      <WidgetContainer>{child}</WidgetContainer>
    ));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        className="bg-gray-200 p-4 top-0 w-full z-10"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {header}
      </Header>
      <div className="body-container relative justify-end flex-grow">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="overflow-auto flex-grow h-auto  p-4 w-full max-w-[600px] max-h-100vh  md:mx-auto ">
          {renderChildren()}
        </main>
      </div>
      <Footer className="bg-gray-200 p-4 fixed bottom-0 w-full z-10">
        {footer}
      </Footer>
    </div>
  );
};

export default PageLayout;
