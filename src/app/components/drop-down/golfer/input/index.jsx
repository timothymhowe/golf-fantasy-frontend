import React from "react";
import { Combobox } from "@headlessui/react";
import { debounce } from "lodash";
import { SelectedGolfer } from ".././table-row";
import { set } from "date-fns";

const inputClassName =
  "w-full py-2 px-3 border border-grey-800 shadow-sm focus:outline-none focus:ring-black focus:border-indigo-500 sm:text-sm text-black font-[16px]";

const GolferComboboxInput = ({
  setIsLoading,
  setInputValue,
  selectedGolfer,
  setSelectedGolfer,
}) => {
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="relative">
      {selectedGolfer ? <SelectedGolfer golfer={selectedGolfer} setSelectedGolfer={setSelectedGolfer} /> :
      <Combobox.Input
        onFocus={handleInputChange}
        onChange={handleInputChange}
        className={inputClassName}
        placeholder="Search for a golfer"
        style={{fontFamily: "Verdana, sans-serif",
      fontSize: "20px"}}
      />}
    </div>

    // <Combobox.Input
    //     onChange={handleInputChange}
    //     className={inputClassName}
    //     placeholder="Search for a golfer"
    //     // style={{ fontFamily: 'Verdana, sans-serif' }}
    // />
  );
};

export default GolferComboboxInput;
