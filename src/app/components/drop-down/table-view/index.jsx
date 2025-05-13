"use client";

import React from "react";

/**
 * Default width for the dropdown component
 * @constant {string}
 */
const DROP_DOWN_DEFAULT_WIDTH = "w-[80px]";

/**
 * Custom dropdown component for switching between different table views.  Based on the drop down view filter for the Player screen in the ESPN Fantasy Football app on iOS.
 *
 * @param {object} props
 * @param {object} props.views - Object containing view configurations with shape { [key: string]: { id: string, label: string, shortLabel: string, columns: array } }
 * @param {string} props.activeView - ID of the currently selected view
 * @param {(viewId: string) => void} props.onViewChange - Callback function when view selection changes
 * @param {string} [props.width=DROP_DOWN_DEFAULT_WIDTH] - Optional CSS width class for the component
 * @returns {JSX.Element} A dropdown component with a header label and custom styled select
 *
 * @example
 * const views = {
 *   basic: {
 *     id: 'basic',
 *     label: 'Basic Info',
 *     shortLabel: 'Basic',
 *     columns: [...]
 *   }
 * };
 *
 * <TableViewSelector
 *   views={views}
 *   activeView="basic"
 *   onViewChange={(viewId) => setActiveView(viewId)}
 *   width="w-[150px]"
 * />
 */
const TableViewSelector = ({
  views,
  activeView,
  onViewChange,
  width = DROP_DOWN_DEFAULT_WIDTH,
}) => {
  return (
    <div className={`flex flex-col items-start ${width}`}>
      <span className="text-[11px] text-white/50 font-medium mb-0.5 text-right w-full pr-5">
        View:
      </span>
      <div className="flex items-center gap-1 w-full relative">
        <span className="text-[#BFFF00] font-medium truncate text-[14px] leading-none tracking text-right w-full">
          {views[activeView].shortLabel}
        </span>
        <select
          value={activeView}
          onChange={(e) => onViewChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        >
          {Object.values(views).map((view) => (
            <option key={view.id} value={view.id}>
              {view.label}
            </option>
          ))}
        </select>
        <svg
          className="w-4 h-4 text-[#BFFF00] flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default TableViewSelector;
