// Constants
const SCORE_WIDTH = "w-[20px] self-center tracking-tighter";

/**
 * Estimates cut line based on current positions
 * @param {Object} liveStats - Object containing player stats from the API
 * @returns {number|null} Estimated cut line score or null if can't be determined
 */
const findEstimatedCutLine = (liveStats) => {
  if (!liveStats) return null;

  let cutScore = null;
  let lowestAbove65Position = Infinity;

  Object.entries(liveStats).forEach(([_, golfer]) => {
    const pos = parseInt(golfer.info.position?.replace("T", "")) || 0;

    if (pos > 65 && pos < lowestAbove65Position) {
      lowestAbove65Position = pos;
      cutScore = golfer.info.total;
    }
  });

  return cutScore--;
};

/**
 * Checks for actual cuts in the live stats, based on the value "CUT" in the position field for the golfer
 * @param {*} liveStats
 * @returns
 */
const findActualCutLine = (liveStats) => {
  if (!liveStats) return null;

  // Find all players marked as "CUT"
  const cutScores = Object.values(liveStats)
    .filter((player) => player.info.position === "CUT")
    .map((player) => player.info.total);

  // If we have any cuts, return the highest cut score minus 1
  if (cutScores.length > 0) {
    console.log("cut value", Math.min(...cutScores) - 1);
    
    return Math.min(...cutScores) - 1;
  }

  return null;
};

// Components
export const CutLineRow = ({ score, probability } = getCutLines()) => {
  if (score === null) return null;

  const scoreDisplay = score === 0 ? "E" : score > 0 ? `+${score}` : score;
  const hasCuts = probability === 100; // We set probability to 100 for actual cuts

  return (
    <tr className="h-6 bg-neutral-800 text-[10px] text-yellow-500/70 ">
      <td className="px-1 text-right" colSpan={7}>
        {hasCuts
          ? `The following golfers missed the cut at ${scoreDisplay}`
          : `Projected cut: ${scoreDisplay}`}
      </td>
      <td colSpan={10}></td>
    </tr>
  );
};

/**
 * Calculates cut line based on tournament state
 */
export const getCutLines = ({
  currentRound,
  fieldSize,
  playersThruFirstHole,
  bigFetchData,
}) => {
  // First check if we have any actual cuts
  const actualCutLine = findActualCutLine(
    bigFetchData?.tournament_stats?.live_stats
  );
  if (actualCutLine !== null) {
    return [
      {
        score: actualCutLine,
        probability: 100,
      },
    ];
  }

  // For rounds 1 and 2, use predictions
  if (currentRound <= 2) {
    
    // In round 1, only show when enough players have started
    if (currentRound === 1) {
      const halfField = Math.floor(fieldSize / 2);
      const threshold = halfField - 10;

      console.log("playersThruFirstHole", playersThruFirstHole);
      if (playersThruFirstHole < threshold) {
        return [];
      }
    }

    // Use predictions for both rounds 1 and 2
    if (
      bigFetchData?.cutline_predictions?.predictions &&
      Object.keys(bigFetchData.cutline_predictions.predictions).length > 0
    ) {
      return Object.entries(bigFetchData.cutline_predictions.predictions)
        .map(([score, probability]) => ({
          score: parseInt(score),
          probability,
        }))
        .sort((a, b) => a.score - b.score);
    } else {
      // Fallback to estimated cut line if no predictions available
      const estimatedCutLine = findEstimatedCutLine(
        bigFetchData?.tournament_stats?.live_stats
      );
      return estimatedCutLine !== null
        ? [
            {
              score: estimatedCutLine,
              probability: 100,
            },
          ]
        : [];
    }
  }

  return [];
};
