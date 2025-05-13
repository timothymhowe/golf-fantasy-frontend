import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";
import { firestoreDb } from "../../../../config/firebaseConfig";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";
import FilterTable from "./filter-table";

/**
 * PickTableForm Component - Handles golfer selection and pick submission using a table interface
 * @param {Object} weekData - Tournament data for the current week
 * @param {Function} setIsOpen - Controls modal visibility
 * @param {Function} triggerSubmit - Callback to trigger parent update
 */
const PickTableForm = ({ weekData, setIsOpen, triggerSubmit }) => {
  const [selectedGolfer, setSelectedGolfer] = useState(null);
  const [fieldStats, setFieldStats] = useState(null);
  const [pickData, setPickData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();
  const { selectedLeagueMemberId, selectedLeagueId } = useLeague();
  const user = auth.currentUser;

  // Fetch both field stats and pick data
  useEffect(() => {
    const fetchData = async () => {
      if (!weekData?.id || !user || !selectedLeagueMemberId) return;
      
      setIsLoading(true);
      try {
        // Fetch field stats
        const statsResponse = await fetch(`/api/pick/field_stats/${weekData.id}`);
        const statsData = await statsResponse.json();

        // Fetch pick data and field list
        const token = await user.getIdToken();
        const pickResponse = await fetch(
          `/api/tournament/dd/${selectedLeagueMemberId}?tournament_id=${weekData.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const pickData = await pickResponse.json();

        if (statsData.success) {
          setFieldStats(statsData.data);
        }
        setPickData(pickData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [weekData?.id, user, selectedLeagueMemberId]);

  /**
   * Submits pick to both Firestore and legacy database
   * @param {number} tournamentId - Tournament identifier
   * @param {number} golferId - Selected golfer's ID
   */
  const submitPick = async (tournamentId, golferId) => {
    if (!user || !selectedLeagueId) {
      console.error('Missing required data:', { user, selectedLeagueId });
      return;
    }

    try {
      const pickData = {
        timestamp_utc: serverTimestamp(),
        user_id: user.uid,
        user_email: user.email,
        user_display_name: user.displayName || '',
        league_id: selectedLeagueId,
        league_member_id: selectedLeagueMemberId,
        tournament_id: tournamentId,
        tournament_name: weekData.tournament_name || '',
        golfer_id: golferId,
        golfer_name: selectedGolfer.name || '',
        backup: true
      };

      const docRef = await addDoc(collection(firestoreDb, "Picks"), pickData);
      console.log("Firestore backup written with ID:", docRef.id);

      // Submit to legacy database
      const token = await user.getIdToken();
      const response = await fetch(`/api/pick/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          golfer_id: golferId,
          league_member_id: selectedLeagueMemberId,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit pick");
      
      const data = await response.json();
      triggerSubmit();
      setIsOpen(false);
      return data;
    } catch (error) {
      console.error("Failed to submit pick", error);
      throw error;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tournamentId = weekData.id;
    if (selectedGolfer) {
      submitPick(tournamentId, selectedGolfer.id);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <form className="w-full h-full flex flex-col" onSubmit={handleSubmit}>
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-gray-200 text-xl font-bold truncate typography-tight">
          {weekData.tournament_name}
        </h3>
        <h4 className="text-gray-300 text-md italic font-bold mb-2 mt-[-0.5vh] truncate">
          {weekData.course_name}
        </h4>
      </div>

      <div style={{ height: '400px' }}>
        <FilterTable
          fieldStats={fieldStats}
          pickData={pickData}
          selectedGolfer={selectedGolfer}
          onSelectGolfer={setSelectedGolfer}
          isLoading={isLoading}
        />
      </div>

      <div className="px-4 py-2" style={{ minHeight: '3rem' }}>
        {selectedGolfer && (
          <>
            {!selectedGolfer.is_playing_in_tournament && (
              <div className="text-orange-400 bg-orange-400/10 border border-orange-400/20 
                            px-3 py-2 rounded-lg mb-3 text-sm">
                ⚠️ {selectedGolfer.name} is not in the field
              </div>
            )}
            {selectedGolfer.has_been_picked && (
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 
                            px-3 py-2 rounded-lg mb-3 text-sm">
                ⚠️ You have already picked this golfer
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10 flex justify-end gap-2">
        <button 
          type="button" 
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium
                     text-white/70 hover:text-white/90
                     border border-white/10 hover:border-white/20
                     transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedGolfer}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${!selectedGolfer 
              ? 'bg-white/5 text-white/30 cursor-not-allowed' 
              : selectedGolfer.has_been_picked || !selectedGolfer.is_playing_in_tournament
                ? 'bg-red-500/80 hover:bg-red-500 text-white'
                : 'bg-[#BFFF00]/80 hover:bg-[#BFFF00] text-black'
            }
          `}
        >
          {selectedGolfer && (selectedGolfer.has_been_picked || !selectedGolfer.is_playing_in_tournament) 
            ? "Submit Anyway" 
            : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default PickTableForm;
