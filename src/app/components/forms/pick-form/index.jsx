import React, { useState } from "react";
import AutocompleteGolfer from "../../drop-down/golfer";
import { useAuth } from "../../auth-provider";
import { set } from "date-fns";

const PickForm = ({ selectedTournament,setIsOpen, triggerSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedGolfer, setSelectedGolfer] = useState(null);

  const {auth, idToken} = useAuth();
  const user = auth.currentUser;

  const submitPick = async (tournamentId, golferId) => {

    // if the user is authenticated, get the user's token and submit the pick
    if (user) {
      user.getIdToken().then(async (token) => {
        try{
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

        if (!response.ok) {
          throw new Error("Failed to submit pick");
        }
        const data = await response.json();
        console.log(data);

        // Trigger an update in the pick component, and close the modal
        triggerSubmit();
        setIsOpen(false);
        return data;

      } catch (error) {
        console.error("Failed to submit pick", error);
      }
      });
    }
    
  };

  const handleSubmit = (e) => {
    // TODO: Get the tournament ID from the selected tournament, rather than hardcode it
    const tournamentId = 124;

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
        selectedTournament={selectedTournament}
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
