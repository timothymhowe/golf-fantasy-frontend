import React, { useEffect, useState, useCallback } from "react";
import DropdownItem from "./table-row";
import { Combobox, Transition } from "@headlessui/react";
import GolferComboboxInput from "./input";

import { useAuth } from "../../auth-provider";
import unidecode from "unidecode";

function AutocompleteGolfer({
  selectedGolfer,
  setSelectedGolfer,
  selectedTournament,
}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // [selectedGolfer, setSelectedGolfer] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const {auth, idToken} = useAuth();

  // TODO: Don't Hardcode tournament id!!!!
  const tournament_id = 123;


  useEffect(() => {

    if (idToken) {
      (async () => {
        try {
          const response = await fetch(`/api/tournament/dd?tournament_id=${tournament_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          });
          const data = await response.json();
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
        } catch (error) {
          console.error(error);
        }
      })();
    }}, []);

  const GolferComboboxOptionsColumns = (title, className, children) => {
    <span title={title} className={className ? className : ""}>
      {children}
    </span>;
  };

  /**
   * Handler for the event changing
   * @param {*} event
   */
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  /**
   * filters the list of golfers, and unidecodes them to match non-accented chars.
   *
   *
   */
  const filteredGolfers = inputValue
    ? data
        .filter((item) =>
          // TODO: Unidecode the names on the server side when they are written to database, to avoid having to unidecode both the inputs and the data.

          unidecode(item.full_name)
            .toLowerCase()
            .includes(unidecode(inputValue.toLowerCase()))
        )
        .slice(0, 10)
    : data.slice(0, 25);

  

  return (

    <div className="font-verdana">
      <Combobox value={selectedGolfer} onChange={setSelectedGolfer}>
        <div className="relative">
          
          <GolferComboboxInput
            setIsLoading={setIsLoading}
            setInputValue={setInputValue}
            selectedGolfer={selectedGolfer}
            setSelectedGolfer={setSelectedGolfer}
          />
          {!isLoading ?
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Combobox.Options className={optionsContainerClassName}>
              <div
                className={headerClasses}
                style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
              >
                <span title="">Name</span>
                <span title="Is this golfer registered to play this week?">
                  Entered?
                </span>
                <span title="Have you picked this golfer previously?">
                  Picked?
                </span>
              </div>
              {filteredGolfers.map((item) => (
                <DropdownItem item={item} />
              ))}
            </Combobox.Options>
          </Transition> : null}
        </div>
      </Combobox>
    </div>
  );
}

export default AutocompleteGolfer;

const optionsContainerClassName =
  "absolute top-25 left-auto w-auto z-8 bg-white shadow-lg max-h-60 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm md:left-auto md:mx-auto lg:left-0 lg:mx-0 font-verdana";

const headerClasses =
  "px-1 py-1 font-bold text-sm bg-gray-400 sticky top-0 grid grid-cols-3 border border-black z-10 width-auto shadow-md";
