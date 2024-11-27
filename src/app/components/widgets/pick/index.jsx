import React, { useEffect, useState } from "react";
import PickForm from "../../forms/pick-form";
import FormModal from "../../form-modal";
import SquircleImage from "../../avatar/squircle-image";

import { useAuth } from "../../auth-provider";

import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";
import { set } from "date-fns";

import { getStorage, ref, getDownloadURL } from "firebase/storage";

const Pick = ({ setTitle, onChangePick }) => {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState(null);
  const [pick, setPick] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMadePick, setHasMadePick] = useState(false);

  const [submitTrigger, setSubmitTrigger] = useState(false);

  const placeholderImage = "/portrait_placeholder_75.png";

  /**
   * Gets the golfer's photo URL from Firebase Storage
   * Uses higher resolution 200x200 images for the pick display
   * 
   * TODO: Performance Optimization Needed
   * - Implement caching for frequently viewed picks
   * - Add loading state transitions for image loads
   * - Consider preloading images for likely picks
   * - Add error boundary for failed image loads
   * - Investigate CDN configuration for faster loading
   * 
   * @param {string} datagolf_id - The golfer's DataGolf ID
   * @returns {Promise<string>} URL to the golfer's photo or placeholder
   */
  const getGolferPhotoUrl = async (datagolf_id) => {
    if (!datagolf_id) {
      console.log("No datagolf_id provided for pick photo");
      return "/portrait_placeholder_75.png";
    }
  
    try {
      const storage = getStorage();
      const photoRef = ref(storage, `headshots/thumbnails/${datagolf_id}_headshot_200x200.png`);
      const url = await getDownloadURL(photoRef);
      return url;
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.log(`Valid golfer ID ${datagolf_id} but no photo found in storage`);
      } else {
        console.error("Unexpected error loading golfer photo:", error);
      }
      return "/portrait_placeholder_75.png";
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (user) {
      console.log("Fetching tournament data...");
      user.getIdToken().then(token => {
        console.log("Got token, making API call...");
        fetch("/api/tournament/upcoming", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            console.log("API Response:", response.status);
            return response.json();
          })
          .then((data) => {
            console.log("Tournament data received:", data);
            setWeekData(data);
            setIsLoading(false);
          })
          .catch((error) => {
            if (!controller.signal.aborted) {
              console.error("Error fetching tournament data:", error);
              setIsLoading(false);
            }
          });
      });
    } else {
      console.log("No user available for API call");
    }

    return () => controller.abort();
  }, [user]);

  useEffect(() => {
    updateTitle();
  }, [weekData]);

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
    if (weekData) {
      user.getIdToken().then(token => {
        fetch(`/api/pick/current?tournament_id=${weekData.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then(async (data) => {
            console.log("Raw pick data:", data);  // See full pick data
            console.log("DataGolf ID:", data?.datagolf_id);  // Check if datagolf_id exists
            setPick(data);
            
            if (data && data.datagolf_id) {
              try {
                const url = await getGolferPhotoUrl(data.datagolf_id);
                console.log("Firebase URL:", url);  // See what URL we get
                setPhotoUrl(url);
              } catch (error) {
                console.error("Error getting photo URL:", error);
                setPhotoUrl("/portrait_placeholder_75.png");
              }
            } else {
              console.log("No datagolf_id found in pick data");  // Debug why we're using placeholder
              setPhotoUrl("/portrait_placeholder_75.png");
            }
            
            setIsLoading(false);
            if (!data?.error) {
              setHasMadePick(true);
            }
          })
          .catch((error) => {
            console.error("Error fetching pick:", error);
            setPhotoUrl("/portrait_placeholder_75.png");
            setIsLoading(false);
          });
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
                
              >  <PickForm
              weekData={weekData}
              setIsOpen={setIsOpen}
              triggerSubmit={() => setSubmitTrigger(!submitTrigger)}
            ></PickForm></FormModal>
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
            > 
            <PickForm
            weekData={weekData}
            setIsOpen={setIsOpen}
            triggerSubmit={() => setSubmitTrigger(!submitTrigger)}
          ></PickForm></FormModal>
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
