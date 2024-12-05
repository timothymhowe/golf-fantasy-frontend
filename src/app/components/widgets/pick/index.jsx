import React, { useEffect, useState } from "react";
import PickForm from "../../forms/pick-form";
import FormModal from "../../form-modal";
import SquircleImage from "../../avatar/squircle-image";

import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";

import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";
import { set } from "date-fns";

import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { formatTournamentName } from "../../../utils/formatTournamentName";

const Pick = ({ setTitle, onChangePick }) => {
  const { user } = useAuth();
  const { selectedLeagueId, selectedLeagueMemberId } = useLeague();

  const [weekData, setWeekData] = useState(null);
  const [pick, setPick] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMadePick, setHasMadePick] = useState(false);
  const [hasUpcomingTournament, setHasUpcomingTournament] = useState(true);

  const [submitTrigger, setSubmitTrigger] = useState(false);

  const placeholderImage = "/portrait_placeholder_75.png";

  const [isRecentTournament, setIsRecentTournament] = useState(false);

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

    if (user && selectedLeagueId) {
      console.log("Fetching tournament data...");
      user.getIdToken().then(token => {
        console.log("Got token, making API call...");
        fetch(`/api/tournament/upcoming/${selectedLeagueId}`, {
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
            if (data.has_tournament === false) {
              setHasUpcomingTournament(false);
              if (data.most_recent) {
                setIsRecentTournament(true);
                setWeekData(data.most_recent);
              } else {
                setWeekData(null);
              }
            } else {
              setHasUpcomingTournament(true);
              setIsRecentTournament(false);
              setWeekData(data);
            }
            setIsLoading(false);
          })
          .catch((error) => {
            if (!controller.signal.aborted) {
              console.error("Error fetching tournament data:", error);
              setIsLoading(false);
              setHasUpcomingTournament(false);
            }
          });
      });
    }

    return () => controller.abort();
  }, [user, selectedLeagueId]);

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
            {formatTournamentName(weekData.tournament_name)}
          </div>
          <div
            className="text-gray-600 italic text-sm mb-[-2px] text-left
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
    if (!weekData || !selectedLeagueMemberId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    user.getIdToken().then(token => {
      fetch(`/api/pick/current/${selectedLeagueMemberId}?tournament_id=${weekData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then(async (data) => {
        console.log("Raw pick data:", data);

        if (data.status === 'success' && data.has_pick) {
          setPick(data);  // Set the entire data object as the pick
          
          if (data.datagolf_id) {
            try {
              const url = await getGolferPhotoUrl(data.datagolf_id);
              setPhotoUrl(url);
            } catch (error) {
              console.error("Error getting photo URL:", error);
              setPhotoUrl("/portrait_placeholder_75.png");
            }
          } else {
            setPhotoUrl("/portrait_placeholder_75.png");
          }
          
          setHasMadePick(true);
        } else {
          setPick(null);
          setPhotoUrl("/portrait_placeholder_75.png");
          setHasMadePick(false);
        }
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pick:", error);
        setPhotoUrl("/portrait_placeholder_75.png");
        setIsLoading(false);
      });
    });
  }, [weekData, submitTrigger, selectedLeagueMemberId]);

  if (!isLoading && !hasUpcomingTournament && !weekData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="text-gray-600 text-lg mb-2">
          No upcoming tournaments scheduled
        </div>
        <div className="text-gray-400 text-sm">
          Check back later for the next tournament
        </div>
      </div>
    );
  }

  const PickButton = () => (
    <button
      className={`${
        isRecentTournament 
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-700"
      } text-white font-semibold py-2 px-4 border border-green-700 rounded shadow m-2 h-auto transition duration-500 ease-in-out`}
      onClick={() => !isRecentTournament && setIsOpen(true)}
      disabled={isRecentTournament}
    >
      {isRecentTournament ? "Tournament Complete" : "Change Pick"}
    </button>
  );

  if (!isLoading && weekData) {
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
              <PickButton />
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
            <div className="mt-2 text-xs italic text-gray-500 text-center">
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
                <div className="text-gray-500 italic">{pick.first_name}</div>
              </div>
            </a>
          </div>
          <div className="flex items-end">
            <PickButton />
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
