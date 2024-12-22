import React from "react";
import { Combobox } from "@headlessui/react";
import { SelectedGolfer } from ".././table-row";

const GolferComboboxInput = ({
  setIsLoading,
  setInputValue,
  selectedGolfer,
  setSelectedGolfer,
  setDisplayOptions
}) => {
  const handleFocus = () => {
    setDisplayOptions(true);
    setInputValue("");
  };

  const handleBlur = (e) => {
    // Don't hide options if clicking within the combobox options
    const isComboboxOption = e.relatedTarget?.getAttribute('role') === 'option';
    if (isComboboxOption) {
      // Close after selection
      setTimeout(() => setDisplayOptions(false), 50);
      return;
    }
    setTimeout(() => setDisplayOptions(false), 200);
  };

  return (
    <div className="relative">
      {selectedGolfer ? (
        <SelectedGolfer 
          golfer={selectedGolfer} 
          setSelectedGolfer={setSelectedGolfer} 
        />
      ) : (
        <Combobox.Input
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(event) => setInputValue(event.target.value)}
          className="w-full py-3 px-4 
                     bg-black/40 
                     text-white/90 
                     placeholder:text-white/30
                     border border-white/10
                     hover:border-white/20
                     focus:border-[#BFFF00]/50
                     focus:ring-1 
                     focus:ring-[#BFFF00]/20
                     rounded-lg
                     transition-colors
                     duration-200
                     font-[Verdana]
                     text-lg
                     outline-none"
          placeholder="Search for a golfer"
        />
      )}
    </div>
  );
};

export default GolferComboboxInput;
