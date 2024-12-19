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
    <form className={formClasses} onSubmit={handleSubmit}>
      <AutocompleteGolfer
        selectedGolfer={selectedGolfer}
        setSelectedGolfer={setSelectedGolfer}
        selectedTournament={weekData}
        user={user}
      />

      {selectedGolfer && (
        <div className="mt-4">
          {!selectedGolfer.is_playing_in_tournament && (
            <div className="text-amber-600 bg-amber-50 p-3 rounded-md mb-4">
              ⚠️ Warning: {selectedGolfer.first_name} {selectedGolfer.last_name} is not currently in the tournament field
            </div>
          )}
          {selectedGolfer.has_been_picked && (
            <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4">
              ⚠️ Note: You have already picked this golfer in a previous tournament
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button className={cancelClasses} type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className={submitClasses(selectedGolfer)}
          type="submit"
          onClick={handleSubmit}
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
const formClasses = "bg-white rounded px-8 pt-6 pb-8 mb-4";

const cancelClasses = 
  "bg-white border border-red-400 text-red-500 hover:bg-red-50 font-bold py-2 px-4 mr-1 rounded focus:outline-none focus:shadow-outline mt-3";

const submitClasses = (selectedGolfer) => {
  if (!selectedGolfer) {
    return "bg-gray-400 text-gray-200 font-bold py-2 px-4 ml-1 rounded focus:outline-none focus:shadow-outline mt-3";
  }
  
  const hasWarning = selectedGolfer.has_been_picked || !selectedGolfer.is_playing_in_tournament;
  
  return hasWarning
    ? "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-red-300/50 transition-all font-bold py-2 px-4 ml-1 rounded focus:outline-none focus:shadow-outline mt-3"
    : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-blue-300/50 transition-all font-bold py-2 px-4 ml-1 rounded focus:outline-none focus:shadow-outline mt-3";
};
