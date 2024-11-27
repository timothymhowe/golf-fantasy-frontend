import React, { useState } from "react";
import AutocompleteGolfer from "../../drop-down/golfer";
import { useAuth } from "../../auth-provider";
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
  const user = auth.currentUser;

  /**
   * Submits pick to both Firestore and legacy database
   * @param {number} tournamentId - Tournament identifier
   * @param {number} golferId - Selected golfer's ID
   * @param {string} leagueId - League identifier (optional)
   */
  const submitPick = async (tournamentId, golferId, leagueId = "19") => {
    if (!user) return;

    try {
      // Submit to Firestore with enhanced data

      //TODO: Fix golfer name to be full name, not currently populated.
      const docRef = await addDoc(collection(firestoreDb, "Picks"), {
        timestamp_utc: serverTimestamp(),
        user_id: user.uid,
        user_email: user.email,
        user_display_name: user.displayName || '',
        league_id: leagueId,
        tournament_id: tournamentId,
        tournament_name: weekData.tournament_name || '',
        golfer_id: golferId,
        golfer_name: selectedGolfer.name || '',
        backup: true
      });
      console.log("Firestore backup written with ID:", docRef.id);

      // Submit to legacy database
      const token = await user.getIdToken();
      const response = await fetch("/api/pick/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          golfer_id: golferId,
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

      <div className="flex justify-end">
        <button className={cancelClasses} type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className={submitClasses(selectedGolfer)}
          type="submit"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PickForm;
const formClasses = "bg-white rounded px-8 pt-6 pb-8 mb-4";

const cancelClasses =
  "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-1 rounded focus:outline-none focus:shadow-outline mt-3";
const submitClasses = (selectedGolfer) => {
  const baseClasses =
    " font-bold py-2 px-4 ml-1 rounded focus:outline-none focus:shadow-outline mt-3";

  if (selectedGolfer) {
    return "bg-blue-500 hover:bg-blue-700 text-white" + baseClasses;
  } else {
    return "bg-gray-400 disabled text-gray-200" + baseClasses;
  }
};
