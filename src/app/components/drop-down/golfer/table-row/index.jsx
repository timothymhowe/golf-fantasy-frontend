// DropdownItem.js
import React from "react";

const DropdownItem = ({ item, isHighlighted, getItemProps }) => (
  <li
    className={`grid grid-cols-3 px-3 py-2 ${
      isHighlighted ? "bg-gray-200" : ""
    }`}
    {...getItemProps()}
  >
    <div className="flex flex-row">
      <img src="/portrait_placeholder_75.png" className="h-[25px] w-[25px]"/>
      <span className="whitespace-nowrap">{item.full_name}</span>
      <span className="whitespace-nowrap">
        {item.is_playing_in_tournament ? "✅" : ""}
      </span>
      <span className="whitespace-nowrap">
        {item.has_been_picked ? "✅" : ""}
      </span>
    </div>
  </li>
);

export default DropdownItem;
