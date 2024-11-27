"use client";
import React from "react";
import { useState } from "react";
import Header from "../header";
import Footer from "../footer";

import Sidebar from "../sidebar";
import Pick from "../widgets/pick";
import Leaderboard from "../widgets/leaderboard";
import Scoresheet from "../widgets/scoresheet";
import PickHistory from "../widgets/pick-history";

import WidgetContainer from "../widget-container";

import "./layout-styles.css";
import { set } from "date-fns";

/**
 * Represents the layout of a page in the golf fantasy application.
 *
 * @component
 * @param {Object} props - The properties of the PageLayout component.
 * @param {React.ReactNode} props.header - The header component to be rendered.
 * @param {React.ReactNode} props.footer - The footer component to be rendered.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered PageLayout component.
 */
const PageLayout = ({ header, footer, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pickTitle, setPickTitle] = useState(null);

  /**
   * Renders a placeholder list of widgets that will be rendered, only if no children are passed to the PageLayout component.
   *
   * @returns {JSX.Element} The rendered list of widgets.
   */
  const renderChildren = () => {
    if (React.Children.count(children) === 0) {
      return (
        <>
          <WidgetContainer title={pickTitle}>
            <Pick
              setTitle={setPickTitle}
            />
          </WidgetContainer>

          <WidgetContainer title="League Leaderboard">
            <Leaderboard />
          </WidgetContainer>

          <WidgetContainer title="Pick History">
            {/* <PickHistory /> */}
          </WidgetContainer>

          {/* <WidgetContainer title="Scoring Rules">
            <Scoresheet />
          </WidgetContainer> */}
        </>
      );
    }

    return React.Children.map(children, (child) => (
      <WidgetContainer title={child.props.title || "Default Title"}>
        {child}
      </WidgetContainer>
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
        <main className="overflow-auto flex-grow h-auto  p-4 w-full max-w-[600px] max-h-100vh  md:mx-auto">
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
