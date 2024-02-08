import React, { useEffect, useState, Fragment } from "react";
import { useCombobox } from "downshift";
import DropdownItem from "./table-row";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@headlessui/react";
// import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

function AutocompleteGolfer() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournament/dd")
      .then((response) => response.json())
      .then((data) => {
        // Sort the data
        const golfer_data = data.golfers;
        golfer_data.sort((a, b) => {
          // Compare by is_playing_in_tournament
          if (a.is_playing_in_tournament !== b.is_playing_in_tournament) {
            return a.is_playing_in_tournament ? -1 : 1;
          }

          // Compare by has_been_picked
          if (a.has_been_picked !== b.has_been_picked) {
            return a.has_been_picked ? 1 : -1;
          }

          // Compare by last name
          const lastNameComparison = a.last_name.localeCompare(b.last_name);
          if (lastNameComparison !== 0) return lastNameComparison;

          // If last names are equal, compare by first name
          return a.first_name.localeCompare(b.first_name);
        });
        setData(golfer_data);
        setIsLoading(false);
      });
  }, []);

  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    inputValue,
  } = useCombobox({
    items: data,
    itemToString: (item) => (item ? item.full_name : ""),
  });

  const filteredItems = inputValue
    ? data.filter((item) =>
        item.full_name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : data;

  return (
    <div className="w-64">
      <label
        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        htmlFor="golfer"
      >
        Golfer
      </label>
      <div className="relative">
        <input
          {...getInputProps()}
          className="border border-gray-300 rounded-none px-3 py-2 w-full"
        />
        <div className="border border-gray-300 rounded-none mt-1 w-full absolute z-10">
          <div className="grid grid-cols-3 text-xs font-bold p-2">
            <span>Name</span>
            <span>Playing</span>
            <span>Picked</span>
          </div>
          <ul
            {...getMenuProps()}
            className="divide-y divide-gray-300 max-h-60 overflow-auto"
          >
            {isOpen &&
              (isLoading ? (
                <li className="px-3 py-2">Loading...</li>
              ) : (
                filteredItems.map((item, index) => (
                  <DropdownItem
                    key={`${item.id}${index}`}
                    item={item}
                    isHighlighted={highlightedIndex === index}
                    getItemProps={() => getItemProps({ item, index })}
                  />
                ))
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AutocompleteGolfer;