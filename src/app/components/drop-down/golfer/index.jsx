import React, { useEffect, useState, useCallback } from "react";
import DropdownItem from "./table-row";
import { Combobox, Transition } from "@headlessui/react";
import GolferComboboxInput from "./input";

import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";
import unidecode from "unidecode";

/**
 * AutocompleteGolfer component provides a searchable dropdown for golfer selection
 * @param {Object} selectedGolfer - Currently selected golfer
 * @param {Function} setSelectedGolfer - Handler to update selected golfer
 * @param {Object} selectedTournament - Tournament context for golfer list
 * @param {Object} user - User context for authentication
 */
function AutocompleteGolfer({
  selectedGolfer,
  setSelectedGolfer,
  selectedTournament,
  user,
}) {
  const {selectedLeagueMemberId} = useLeague();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [displayOptions, setDisplayOptions] = useState(false);

  /**
   * Fetches golfer data when tournament and user are available
   * Includes debug logging to trace data flow
   */
  useEffect(() => {
    console.log("=== AutocompleteGolfer Debug ===");
    console.log("User:", user ? "Present" : "Missing");
    console.log("Selected Tournament:", selectedTournament);
    
    if (user && selectedTournament?.id) {
      user.getIdToken().then(token => {
        const url = `/api/tournament/dd/${selectedLeagueMemberId}?tournament_id=${selectedTournament.id}`;
        console.log("Fetching from:", url);
        
        fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => {
          console.log("Response status:", response.status);
          return response.json();
        })
        .then(responseData => {
          console.log("Raw response data:", responseData);
          console.log("Setting golfers:", responseData.golfers);
          setData(responseData.golfers || []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching golfers:", error);
          setIsLoading(false);
        });
      });
    }
  }, [user, selectedTournament]);

  /**
   * Filters golfers based on search input
   * Shows first 25 golfers when no input, or up to 10 matching search
   */
  const filteredGolfers = inputValue === ""
    ? data.slice(0, 25)
    : data
        .filter((item) =>
          unidecode(item.full_name)
            .toLowerCase()
            .includes(unidecode(inputValue.toLowerCase()))
        )
        .slice(0, 10);

  console.log("Filtered golfers:", filteredGolfers);
  console.log("Is Loading:", isLoading);

  return (
    <div className="font-verdana">
      <Combobox value={selectedGolfer} onChange={setSelectedGolfer}>
        <div className="relative">
          <GolferComboboxInput
            setIsLoading={setIsLoading}
            setInputValue={setInputValue}
            selectedGolfer={selectedGolfer}
            setSelectedGolfer={setSelectedGolfer}
            setDisplayOptions={setDisplayOptions}
          />
          {!isLoading && filteredGolfers.length > 0 && displayOptions && (
            <Combobox.Options static className={optionsContainerClassName}>
              <div className={headerClasses}>
                <span title="">Name</span>
                <span title="Is this golfer registered to play this week?">
                  Entered?
                </span>
                <span title="Have you picked this golfer previously?">
                  Picked?
                </span>
              </div>
              {filteredGolfers.map((item) => (
                <DropdownItem key={item.id} item={item} />
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}

export default AutocompleteGolfer;

// Style constants
const optionsContainerClassName =
  "absolute top-25 left-auto w-auto z-8 bg-white shadow-lg max-h-60 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm md:left-auto md:mx-auto lg:left-0 lg:mx-0 font-verdana";

const headerClasses =
  "px-1 py-1 font-bold text-sm bg-gray-400 sticky top-0 grid grid-cols-3 border border-black z-10 width-auto shadow-md";
