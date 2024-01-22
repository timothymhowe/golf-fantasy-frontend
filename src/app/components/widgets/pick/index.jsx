import React from "react";
import PickForm from "../../forms/pick-form";

const Pick = ({ hasMadePick, pick, onChangePick }) => {
  const placeholderImage = "https://t3.ftcdn.net/jpg/01/78/64/92/360_F_178649245_UjyN9fuyvsLFro8jKc4PgmIk1FSUEVZY.jpg"; // Placeholder image URL

  if (hasMadePick) {
    return (
      <div className="w-[100%] relative h-fill flex flex-row justify-between">
        <div className="flex flex-col justify-center items-center m-2">
          <img
            src={placeholderImage}
            alt="Player"
            className="rounded-full w-24 h-24"
          />
          <h4 className="">{pick}</h4>
        </div>
        <div className="flex items-center">
        <button
          className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2 h-[65%]"
          onClick={onChangePick}
        >
          Change
          Pick
        </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="relative h-fill">
        
      <PickForm />
      </div>
    );
  }
};

export default Pick;
