import React, { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { Tooltip } from "react-tooltip";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Image from "next/image";

/**
 * Gets the golfer's photo URL from Firebase Storage
 * 
 * TODO: Photo Loading Optimization
 * Current behavior: Makes Firebase Storage requests for all golfers with DataGolf IDs,
 * resulting in 404 console errors for valid golfers without stored photos.
 * 
 * Potential solutions:
 * 1. Implement client-side caching to prevent repeated 404s:
 *    - Use Set/Map to track missing photos during session
 *    - Consider localStorage for persistent caching
 * 
 * 2. Server-side improvements:
 *    - Maintain a list of golfers with confirmed photos
 *    - Add API endpoint to check photo existence before requesting
 *    - Implement bulk photo existence checking
 * 
 * 3. Photo management:
 *    - Create system to track/flag missing photos
 *    - Implement automated photo collection for new golfers
 *    - Consider CDN or alternative storage solutions
 * 
 * Current implementation uses try-catch to handle missing photos gracefully,
 * but still generates 404 console errors from Firebase Storage internals.
 * 
 * TODO: * - Implement caching for photo URLs
 * - Consider preloading images for top N golfers
 * - Investigate using Firebase Storage CDN configuration
 * - Add loading state/skeleton for images
 * 
 * @param {string} datagolf_id - The golfer's DataGolf ID
 * @returns {Promise<string>} URL to the golfer's photo or placeholder
 */
const getGolferPhotoUrl = async (datagolf_id) => {
  if (!datagolf_id) {
    return "/portrait_placeholder_75.png";
  }

  try {
    const storage = getStorage();
    const photoRef = ref(storage, `headshots/thumbnails/${datagolf_id}_headshot_100x100.png`);
    const url = await getDownloadURL(photoRef);
    return url;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.log(`Valid golfer ID ${datagolf_id} but no photo found in storage`);
    }
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
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");
  const isPlayingInTournament = item?.is_playing_in_tournament ?? false;
  const hasBeenPicked = item?.has_been_picked ?? false;
  
  useEffect(() => {
    if (item?.datagolf_id) {
      getGolferPhotoUrl(item.datagolf_id).then(setPhotoUrl);
    }
  }, [item?.datagolf_id]);
  
  return (
    <Combobox.Option key={item.id} value={item} className={optionClasses}>
      <div
        className={contentClasses}
        style={{ 
          gridTemplateColumns: "38px 1fr"
        }}
      >
        <div className="h-[38px] w-[38px]">
          <Image 
            width={100}
            height={100}
            src={photoUrl} 
            className={`${imageClasses} ${!isPlayingInTournament ? 'opacity-50 grayscale' : ''}`}
            alt={item.full_name}
            loading="lazy"
          />
        </div>
        <div className={nameContainerClasses}>
          <span className={`
            ${!isPlayingInTournament ? 'text-gray-400' : ''}
            ${hasBeenPicked ? 'text-red-500' : ''}
            ${lastNameClasses}
          `}>
            {item.last_name.toUpperCase()},
          </span>
          <span className={`
            ${!isPlayingInTournament ? 'text-gray-400' : ''}
            ${hasBeenPicked ? 'text-red-500' : ''}
            ${firstNameClasses}
          `}>
            {item.first_name}
          </span>
        </div>
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
          <Image 
          width={100}
          height={100}
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