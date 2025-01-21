import React, { useEffect, useState } from "react";
import PickForm from "../../forms/pick-form";
import FormModal from "../../form-modal";
import SquircleImage from "../../avatar/squircle-image";

import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";

import { zonedTimeToUtc, utcToZonedTime, format } from "date-fns-tz";

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

  // Add a new state to track if tournament data is fully loaded
  const [isTournamentDataLoaded, setIsTournamentDataLoaded] = useState(false);

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

    // Clear all relevant state when league changes
    setIsTournamentDataLoaded(false);
    setWeekData(null);
    setPick(null);
    setPhotoUrl(placeholderImage);
    setHasMadePick(false);

    if (user && selectedLeagueId) {
      console.log(
        "🏌️ Tournament fetch triggered by leagueId:",
        selectedLeagueId
      );
      user.getIdToken().then((token) => {
        console.log("Got token, making API call...");
        fetch(`/api/tournament/upcoming/${selectedLeagueId}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("📅 Setting weekData:", data);
            if (data.has_tournament === false) {
              setHasUpcomingTournament(false);
              if (data.most_recent) {
                setIsRecentTournament(true);
                if (data.most_recent.id) {
                  setWeekData(data.most_recent);
                }
              }
            } else {
              setHasUpcomingTournament(true);
              setIsRecentTournament(false);
              setWeekData(data);
            }
            setIsLoading(false);
            setIsTournamentDataLoaded(true);
          });
      });
    }

    return () => {
      controller.abort();
      // Clear state in cleanup
      setIsTournamentDataLoaded(false);
      setWeekData(null);
      setPick(null);
      setPhotoUrl(placeholderImage);
      setHasMadePick(false);
    };
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
    if (weekData) {
      setTitle(
        <div className="flex flex-col w-fit">
          <div className="text-white/90 font-bold whitespace-nowrap pr-4 text-xl mb-[-2px]">
            {formatTournamentName(weekData.tournament_name)}
          </div>
          <div className="text-white/60 italic text-sm mb-[-2px] text-left">
            {weekData.course_name}
          </div>
        </div>
      );
    } else {
      setTitle(
        <div className="flex flex-col justify-left animate-pulse">
          <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      );
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (!weekData || !selectedLeagueMemberId || !isTournamentDataLoaded) {
      console.log("⛳ Pick fetch skipped - waiting for data:", {
        weekData: !!weekData,
        selectedLeagueMemberId,
        isTournamentDataLoaded,
      });
      setIsLoading(false);
      return;
    }

    console.log("🎯 Pick fetch triggered:", {
      weekDataId: weekData?.id,
      leagueMemberId: selectedLeagueMemberId,
      submitTrigger,
    });

    setIsLoading(true);

    const fetchPick = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `/api/pick/current/${selectedLeagueMemberId}?tournament_id=${weekData.id}`,
          {
            signal: controller.signal, // Add abort signal to fetch
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        console.log("Raw pick data:", data);

        if (data.status === "success" && data.has_pick) {
          setPick(data);

          if (data.datagolf_id) {
            try {
              const url = await getGolferPhotoUrl(data.datagolf_id);
              setPhotoUrl(url);
            } catch (error) {
              console.error("Error getting photo URL:", error);
              setPhotoUrl(placeholderImage);
            }
          } else {
            setPhotoUrl(placeholderImage);
          }

          setHasMadePick(true);
        } else {
          setPick(null);
          setPhotoUrl(placeholderImage);
          setHasMadePick(false);
        }

        setIsLoading(false);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Pick fetch aborted");
          return;
        }
        console.error("Error fetching pick:", error);
        setPhotoUrl(placeholderImage);
        setIsLoading(false);
      }
    };

    fetchPick();

    return () => {
      console.log("🚫 Aborting pick fetch");
      controller.abort(); // Abort any in-flight requests when dependencies change
    };
  }, [weekData, submitTrigger, selectedLeagueMemberId, isTournamentDataLoaded]);

  if (!isLoading && !hasUpcomingTournament && !weekData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="text-white/70 text-lg mb-2">
          No upcoming tournaments scheduled
        </div>
        <div className="text-white/50 text-sm">
          Check back later for the next tournament
        </div>
      </div>
    );
  }

  const PickButton = () => (
    <button
      className={`${
        isRecentTournament
          ? "bg-white/10 cursor-not-allowed"
          : "bg-[#BFFF00] hover:bg-[#9FDF00] text-black"
      } font-semibold py-2 px-2 rounded shadow m-2 h-auto transition duration-500 ease-in-out`}
      onClick={() => !isRecentTournament && setIsOpen(true)}
      disabled={isRecentTournament}
    >
      {isRecentTournament ? "Locked" : "Change Pick"}
    </button>
  );

  const DateTimeObject = ({ dateTime }) => (
    <div className="flex flex-col justify-center items-center">
      <div className="m-1 text-xs italic text-white/50 text-center">
        Picks lock on {format(dateTime, "EEEEEEE, MM/dd/yyyy")} at{" "}
        {format(dateTime, "hh:mm a zzz")}
      </div>
    </div>
  );

  if (!isLoading && weekData) {
    const dateTimeString = `${weekData.start_date}T${weekData.start_time}`;
    const dateTimeUtc = zonedTimeToUtc(dateTimeString, weekData.time_zone);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateTime = utcToZonedTime(dateTimeUtc, userTimeZone);

    if (!hasMadePick) {
      return (
        <div className="flex flex-col w-[100%]">
          <div className="w-[100%] relative h-fill flex flex-row justify-between">
            <div className="mb-2">
              <a className="flex flex-row pl-2 items-top">
                <SquircleImage photoUrl={photoUrl} />
                <div className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1 text-white/90">
                  {/* Empty state - no pick made yet */}
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
                />
              </FormModal>
            </div>
          </div>
          <hr className="border-white/10" />
          <DateTimeObject dateTime={dateTime} />
        </div>
      );
    }

    return (
      <div className="flex flex-col w-[100%]">
        <div className="w-[100%] relative h-fill flex flex-row justify-between">
          <div className="mb-2">
            <a className="flex flex-row pl-2 items-top">
              <SquircleImage photoUrl={photoUrl} />
              <div className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1">
                <div className="text-xl text-white/90">
                  {pick.last_name.toUpperCase()},
                </div>
                <div className="text-white/60 italic">{pick.first_name}</div>
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
              />
            </FormModal>
          </div>
        </div>
        <hr className="border-white/10" />
        <DateTimeObject dateTime={dateTime} />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col w-[100%] animate-pulse">
        <div className="w-[100%] relative h-fill flex flex-row justify-between">
          <div className="mb-2">
            <a className="flex flex-row pl-2 items-top">
              <div className="h-24 w-24 bg-white/10 rounded-[31px] mr-2"></div>
              <div className="w-auto h-fill text-left ml-2 flex flex-col align-bottom mt-1">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
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
