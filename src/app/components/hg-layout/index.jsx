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
import LeaguePicks from "../widgets/league-picks";

import WidgetContainer from "../widget-container";

import { LeagueProvider } from "../league-context";

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
  const [leaguePicksTitle, setLeaguePicksTitle] = useState(null);


  // TODO: Refactor this.  Currently it hardcodes the widgets that are shown. We should make this more dynamic. More React-ful.  Fine for now, but needs work. 

  const renderChildren = () => {
    if (React.Children.count(children) === 0) {
      return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <WidgetContainer title={pickTitle}>
              <Pick setTitle={setPickTitle} />
            </WidgetContainer>

            <WidgetContainer title="League Leaderboard" defaultCollapsed={true}>
              <Leaderboard />
            </WidgetContainer>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <WidgetContainer title="League Schedule" defaultCollapsed={true}>
              <PickHistory />
            </WidgetContainer>

            <WidgetContainer title={leaguePicksTitle} defaultCollapsed={true}>
              <LeaguePicks setTitle={setLeaguePicksTitle} />
            </WidgetContainer>
          </div>
        </div>
      );
    }

    return (
      <div className="grid">
        {React.Children.map(children, (child) => (
          <WidgetContainer title={child.props.title || "Default Title"}>
            {child}
          </WidgetContainer>
        ))}
      </div>
    );
  };

  return (
    <LeagueProvider>
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
        <main className="overflow-auto flex-grow h-auto p-4 w-full max-w-[1200px] max-h-100vh md:mx-auto">
          {renderChildren()}
        </main>
      </div>
      <Footer className="bg-gray-200 p-4 fixed bottom-0 w-full z-10">
        {footer}
      </Footer>
      </div>
    </LeagueProvider>
  );
};

export default PageLayout;