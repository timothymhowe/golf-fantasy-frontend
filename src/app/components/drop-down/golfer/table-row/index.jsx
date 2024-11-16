import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { Tooltip } from "react-tooltip";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

/**
 * Gets the golfer's photo URL from Firebase Storage
 * TODO: Performance Optimization Needed
 * - Implement caching for photo URLs
 * - Consider preloading images for top N golfers
 * - Investigate using Firebase Storage CDN configuration
 * - Add loading state/skeleton for images
 * @param {string} datagolf_id - The golfer's DataGolf ID
 * @returns {Promise<string>} The photo URL or placeholder
 */
const getGolferPhotoUrl = async (datagolf_id) => {
  try {
    const storage = getStorage();
    const photoRef = ref(storage, `headshots/thumbnails/${datagolf_id}_headshot_100x100.png`);
    return await getDownloadURL(photoRef);
  } catch (error) {
    console.error("Error loading golfer photo:", error);
    return "/portrait_placeholder_75.png";
  }
};

/**
 * DropdownItem component represents an item in the dropdown list of the golfer table row.
 *
 * @param {Object} param0 - The props object.
 * @param {Object} param0.item - The golfer item.
 * @param {boolean} param0.isHighlighted - Indicates if the item is highlighted.
 * @param {function} param0.getItemProps - Function to get the props for the item.
 * @returns {JSX.Element} The rendered DropdownItem component.
 */
const DropdownItem = ({ item }) => {
  console.log("DropdownItem received:", item);  // Debug log
  
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");
  const isPlayingInTournament = item?.is_playing_in_tournament ?? false;  // Add null check
  const hasBeenPicked = item?.has_been_picked ?? false;  // Add null check
  
  useEffect(() => {
    console.log("DataGolf ID:", item?.datagolf_id);  // Debug log
    if (item?.datagolf_id) {  // Add null check
      getGolferPhotoUrl(item.datagolf_id).then(setPhotoUrl);
    }
  }, [item?.datagolf_id]);
  
  return (
    <Combobox.Option key={item.id} value={item} className={optionClasses}>
      <div
        className={contentClasses}
        style={{ gridTemplateColumns: "auto 10fr 1fr 1fr" }}
      >
        <div className="h-[38px] w-[38px]">
          <img 
            src={photoUrl} 
            className={imageClasses} 
            alt={item.full_name}
            loading="lazy"  // Add lazy loading for performance
          />
        </div>
        <div
          className={nameContainerClasses}
          style={{ fontFamily: "Verdana, sans-serif" }}
        >
          <span
            className={generateTextClasses(
              lastNameClasses,
              isPlayingInTournament,
              hasBeenPicked
            )}
          >
            {item.last_name.toUpperCase()},
          </span>
          <span
            className={generateTextClasses(
              firstNameClasses,
              isPlayingInTournament,
              hasBeenPicked
            )}
          >
            {item.first_name}
          </span>
        </div>
        {!isPlayingInTournament ? (
            <a
              data-tooltip-id="not-playing-tip"
              data-tooltip-content="This golfer is not in the tournament field."
              className="cursor-pointer mx-1 font-md"
            >
              ⚠️
              <Tooltip id="not-playing-tip" />
            </a>
          ): (
            <span className="mx-1">&nbsp;</span> 
          )}
        <a
          data-tooltip-id="has-been-picked-tip"
          data-tooltip-content="You've already picked this golfer before."
          className="cursor-pointer  mx-1 font-md"
        >
          {/* TODO: Switch this back to being the correct boolean, from !isPlayingInTournament to hasBeenPicked  */}
          {hasBeenPicked ? "🚫" : ""}
          <Tooltip id="has-been-picked-tip" />
        </a>
      </div>
    </Combobox.Option>
  );
};
export default DropdownItem;

/**
 * Component that mimics the selected golfer row in the AutocompleteGolfer, and then overlays it on top of the AutoCompleteGolfer when a golfer is selected.
 *
 * @param {*} param0
 * @returns
 */
export const SelectedGolfer = ({ golfer, setSelectedGolfer }) => {
  console.log("SelectedGolfer received:", golfer);  // Debug log
  
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");
  const isPlayingInTournament = golfer?.is_playing_in_tournament ?? false;  // Add null check
  const hasBeenPicked = golfer?.has_been_picked ?? false;  // Add null check

  useEffect(() => {
    if (golfer?.datagolf_id) {
      getGolferPhotoUrl(golfer.datagolf_id).then(setPhotoUrl);
    }
  }, [golfer?.datagolf_id]);

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleOnClick = () => {
    setIsTooltipVisible(!isTooltipVisible);
  };
  if (golfer) {
    return (
      <div
        className="flex flex-row items-center h-[40px] border border-black bg-[#f8f8f8] cursor-pointer text-black cursor-default"
        style={{ gridTemplateColumns: "auto 2fr 2fr" }}
      >
        <div className="h-[38px] w-[38px]">
          <img 
            src={photoUrl} 
            className={imageClasses} 
            alt={golfer.full_name}
            loading="lazy"
          />
        </div>{" "}
        <div
          className={nameContainerClasses}
          style={{ fontFamily: "Verdana, sans-serif" }}
        >
          <span
            className={generateTextClasses(
              lastNameClasses,
              isPlayingInTournament,
              hasBeenPicked
            )}
          >
            {golfer.last_name.toUpperCase()},
          </span>
          <span
            className={generateTextClasses(
              firstNameClasses,
              isPlayingInTournament,
              hasBeenPicked
            )}
          >
            {golfer.first_name}
          </span>
        </div>
        <div className="h-full ml-auto">
          <a
            data-tooltip-id="has-been-picked-tip"
            data-tooltip-content="You've already picked this golfer."
            className="cursor-pointer  mx-2 font-md"
          >
            {hasBeenPicked ? "⚠️" : ""}
          </a>
          <Tooltip id="has-been-picked-tip" />
          <button
            onClick={() => setSelectedGolfer(null)}
            className="ml-auto h-full px-2 font-bold text-gray-700 border-l border-black"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }; 
};


const optionClasses =
  " grid grid-cols-3 border-b border-l border-r border-black hover:bg-gray-200 h-[40px] bg-[#f8f8f8] cursor-pointer";
const contentClasses = "grid text-black grid-cols-4 w-max";
const nameContainerClasses =
  "whitespace-nowrap flex flex-col h-auto space-y-[-4px] ml-1";
const lastNameClasses = "whitespace-nowrap flex flex-col";
const firstNameClasses = "whitespace-nowrap italic text-grey-800 text-xs";

const imageClasses = "h-[38px] relative object-cover";

const notPlayingClasses = " text-gray-500";
const alreadyPickedClasses = "text-red-500 line-through";

function generateTextClasses(
  baseClasses,
  isPlayingInTournament,
  HasBeenPicked
) {
  let classes = baseClasses;
  if (HasBeenPicked) {
    classes += ` ${alreadyPickedClasses}`;
  }

  if (!isPlayingInTournament) {
    classes += ` ${notPlayingClasses}`;
  }

  return classes;
}