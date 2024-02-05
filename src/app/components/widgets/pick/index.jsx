import React, { useEffect } from "react";
import PickForm from "../../forms/pick-form";

import { useAuth } from "../../auth-provider";

const Pick = ({ hasMadePick, pick, onChangePick }) => {
  const auth_token = useAuth();

  // useEffect(() => {
  //   if (auth_token) {
  //     fetch("/api/pick/mypick", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //       .then((response) => response.json())
  //       .then((data) => console.log(data))
  //       .catch((error) => console.error(error));
  //   }
  // }, []);

  const placeholderImage =
    "https://a.espncdn.com/combiner/i?img=/i/headshots/golf/players/full/9938.png"; // Placeholder image URL

  const thisWeek = "Farmers Insurance Open";
  const weekNumber = "4";

  if (hasMadePick) {
    return (
      <div className="flex flex-col w-[100%] ">
        <div className="flex flex-row justify-left">
          <div className="text-green-700 font-bold whitespace-nowrap pr-4">
            Week {weekNumber}:
          </div>
          <div className="text-grey-300 italic">{thisWeek}</div>
        </div>
        <div className="w-[100%] relative h-fill flex flex-row justify-between">
          <div className="flex flex-col justify-center items-center m-2">
            <a href={placeholderImage}>
              <img
                src={placeholderImage}
                alt="Player"
                className="rounded-full w-24 h-24 bg-gray-200 object-cover"
              />
              <div className="w-100 text-center">{pick}</div>
            </a>
          </div>
          <div className="flex items-end">
            <button
              className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2 h-auto%]"
              onClick={onChangePick}
            >
              Change Pick
            </button>
          </div>
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
