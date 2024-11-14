import React, { useEffect, useState } from "react";
import PickForm from "../../forms/pick-form";
import FormModal from "../../form-modal";
import SquircleImage from "../../avatar/squircle-image";

import { useAuth } from "../../auth-provider";

import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";
import { set } from "date-fns";

const Pick = ({ setTitle, onChangePick }) => {
  const { auth, idToken } = useAuth();
  const [weekData, setWeekData] = useState(null);
  const [pick, setPick] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMadePick, setHasMadePick] = useState(false);

  const [submitTrigger, setSubmitTrigger] = useState(false);

  const placeholderImage = "/portrait_placeholder_75.png";

  // TODO: Make this dynamic based on what week the user wants to pick for, currently it's just the current week.  Make sure to account for a race condition.
  useEffect(() => {
    if (idToken) {
      fetch("/api/tournament/upcoming", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setWeekData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [idToken]);

  /**
   * Helper function that updates the title of the widget
   *
   * TODO: THIS IS AWFUL PROBABLY?  LIKE A STATE WIDGET GARBO?  F THAT
   */
  const updateTitle = () => {
    // TODO: Fix this awful trash you garbage human
    if (weekData) {
      setTitle(
        <div className="flex flex-col w-fit">
          <div className="text-green-700 font-bold whitespace-nowrap pr-4 text-xl mb-[-2px]">
            {weekData.tournament_name}
          </div>
          <div
            className="text-gray-400 italic text-sm mb-[-2px] text-left
          "
          >
            {weekData.course_name}
          </div>
        </div>
      );
    } else {
      setTitle(
        <div className="flex flex-col justify-left animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      );
    }
  };

  useEffect(() => {
    updateTitle();
    if (weekData) {
      fetch(`/api/pick/current?tournament_id=${weekData.id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setPick(data);
          setPhotoUrl(
            data.photo_url ? data.photo_url + "?w=250" : placeholderImage
          );
          setIsLoading(false);
          if (!data?.error) {
            setHasMadePick(true);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [weekData, submitTrigger]);

  if (!isLoading && pick && weekData) {
    const dateTimeString = `${weekData.start_date}T${weekData.start_time}`; // Combine date and time into a single string
    const dateTimeUtc = zonedTimeToUtc(dateTimeString, weekData.time_zone); // Convert to UTC
    const dateTime = utcToZonedTime(dateTimeUtc, "America/New_York"); // Convert to Eastern Time

    if (!hasMadePick) {
      return (
        <div className="flex flex-col w-[100%] ">
          <div className="w-[100%] relative h-fill flex flex-row justify-between">
            <div className="mb-2">
              <a className="flex flex-row pl-2 items-top">
                <SquircleImage photoUrl={photoUrl} />

                <div
                  className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1"
                  style={{ fontFamily: "Verdana, sans-serif" }}
                >
                  {/* <div className="text-xl">{pick.last_name.toUpperCase()},</div>
                    <div className="text-gray-400 italic">{pick.first_name}</div> */}
                </div>
              </a>
            </div>
            <div className="flex items-end">
              <button
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2 h-auto%]"
                onClick={() => setIsOpen(true)}
              >
                Make Pick
              </button>
              <FormModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                onClose={() => setIsOpen(false)}
                children={
                  <PickForm
                    weekData={weekData}
                    setIsOpen={setIsOpen}
                    triggerSubmit={() => setSubmitTrigger(!submitTrigger)}
                  ></PickForm>
                }
              ></FormModal>
            </div>
          </div>
          <hr />
          <div className="flex flex-col justify-center items-center">
            <div className="mt-2 text-xs italic text-gray-600 text-center">
              Picks lock on {format(dateTime, "EEEEEEE, MM/dd/yyyy")} at{" "}
              {format(dateTime, "hh:mm a zzz")}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-[100%] ">
        <div className="w-[100%] relative h-fill flex flex-row justify-between">
          <div className="mb-2">
            <a className="flex flex-row pl-2 items-top">
              <SquircleImage photoUrl={photoUrl} />

              <div
                className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1"
                style={{ fontFamily: "Verdana, sans-serif" }}
              >
                <div className="text-xl">{pick.last_name.toUpperCase()},</div>
                <div className="text-gray-400 italic">{pick.first_name}</div>
              </div>
            </a>
          </div>
          <div className="flex items-end">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 border border-green-700 rounded shadow m-2 h-auto transition duration-500 ease-in-out"
              onClick={() => setIsOpen(true)}
            >
              Change Pick
            </button>
            <FormModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onClose={() => setIsOpen(false)}
              children={
                <PickForm
                  weekData={weekData}
                  setIsOpen={setIsOpen}
                  triggerSubmit={() => setSubmitTrigger(!submitTrigger)}
                ></PickForm>
              }
            ></FormModal>
          </div>
        </div>
        <hr />
        <div className="flex flex-col justify-center items-center">
          <div className="mt-2 text-xs italic text-gray-600 text-center">
            Picks lock on {format(dateTime, "EEEEEEE, MM/dd/yyyy")} at{" "}
            {format(dateTime, "hh:mm a zzz")}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col w-[100%] animate-pulse">
        <div className="w-[100%] relative h-fill flex flex-row justify-between">
          <div className="mb-2">
            <a className="flex flex-row pl-2 items-top">
              <div className="h-24 w-24 bg-gray-300 rounded-[31px] mr-2"></div>
              <div className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </a>
          </div>
          <div className="flex items-end">
            <div className="h-8 bg-blue-500 rounded m-2 w-32"></div>
          </div>
        </div>
        <hr />
        <div className="flex flex-col justify-center items-center">
          <div className="mt-2 text-xs italic text-gray-600 text-center">
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </div>
      </div>
    );
  }
};

export default Pick;
