import React, { useState } from "react";
import AutocompleteGolfer from "../../drop-down/golfer";
import { useAuth } from "../../auth-provider";
import { useLeague } from "../../league-context";
import { set } from "date-fns";

import { firestoreDb } from "../../../../config/firebaseConfig";
import { serverTimestamp, collection,addDoc } from "firebase/firestore";

/**
 * PickForm Component - Handles golfer selection and pick submission
 * @param {Object} weekData - Tournament data for the current week
 * @param {Function} setIsOpen - Controls modal visibility
 * @param {Function} triggerSubmit - Callback to trigger parent update
 */
const PickForm = ({ weekData, setIsOpen, triggerSubmit }) => {
  const [selectedGolfer, setSelectedGolfer] = useState(null);
  const { auth } = useAuth();
  const {selectedLeagueMemberId,selectedLeagueId} = useLeague();
  const user = auth.currentUser;

  /**
   * Submits pick to both Firestore and legacy database
   * @param {number} tournamentId - Tournament identifier
   * @param {number} golferId - Selected golfer's ID
   * @param {string} leagueId - League identifier (optional)
   */
  const submitPick = async (tournamentId, golferId) => {
    if (!user || !selectedLeagueId) {
      console.error('Missing required data:', { user, selectedLeagueId });
      return;
    }

    try {
      // Log the data being sent to Firestore
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
      console.log('Attempting to write to Firestore:', pickData);

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
    // TODO: Get the tournament ID from the selected tournament, rather than hardcode it
    const tournamentId = weekData.id;
    e.preventDefault();
    if (selectedGolfer) {
      submitPick(tournamentId, selectedGolfer.id);
    }
  };

  const handleCancel = () => {
    // TODO: Handle cancel logic here
    setIsOpen(false);
  };

  return (
    <form className="w-full max-w-md mx-auto px-2 py-6" onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-gray-400 text-sm">Make Pick</h2>
        <h3 className="text-gray-200 text-xl font-bold mb-4 truncate">{weekData.tournament_name}</h3>
        
        <AutocompleteGolfer
          selectedGolfer={selectedGolfer}
          setSelectedGolfer={setSelectedGolfer}
          selectedTournament={weekData}
          user={user}
        />
      </div>

      {selectedGolfer && (
        <div className="mb-6">
          {!selectedGolfer.is_playing_in_tournament && (
            <div className="text-orange-400 bg-orange-400/10 border border-orange-400/20 
                          px-3 py-2 rounded-lg mb-3 text-sm">
              ⚠️ {selectedGolfer.first_name} {selectedGolfer.last_name} is not in the field
            </div>
          )}
          {selectedGolfer.has_been_picked && (
            <div className="text-red-400 bg-red-400/10 border border-red-400/20 
                          px-3 py-2 rounded-lg mb-3 text-sm">
              ⚠️ You've already picked this golfer
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
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

export default PickForm;
