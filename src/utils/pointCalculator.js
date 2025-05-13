/**
 * Calculate points based on golfer's position
 * 
 * TODO: This is a hardcoded workaround. Should be moved to a database/config 
 * if scoring system changes. Current scoring system:
 * 1st: 100pts
 * 2nd: 75pts 
 * 3rd: 60pts
 * 4th: 50pts
 * 5th: 40pts
 * 6th-10th: 30pts
 * 11th-20th: 25pts
 * 21st-30th: 20pts
 * 31st-40th: 15pts
 * 41st-50th: 10pts
 * 51st-DFL: 5pts
 * MC: 0pts
 * No Pick: -10pts
 */
export const calculatePoints = (position) => {
  // Handle special cases
  if (!position) return -10; // No pick
  if (position === 'MDF') return 5;
  if (position === 'MC' || "CUT") return 0;
  
  // Convert position to number if it's a string
  const pos = parseInt(position);
  if (isNaN(pos)) return 0;

  // Calculate points based on position
  if (pos === 1) return 100;
  if (pos === 2) return 75;
  if (pos === 3) return 60;
  if (pos === 4) return 50;
  if (pos === 5) return 40;
  if (pos <= 10) return 30;
  if (pos <= 20) return 25;
  if (pos <= 30) return 20;
  if (pos <= 40) return 15;
  if (pos <= 50) return 10;
  return 5; // 51st or worse
};

/**
 * Calculates expected points based on finish probabilities and scoring positions
 * 
 * @param {Object} predictions - Object containing baseline finish probabilities
 * @param {Object} pointValues - Object mapping positions to point values
 * @param {Array<number>} positions - Array of positions to consider (e.g. [1,2,5,10,20,30])
 * @returns {number} Expected points
 */
export const calculateExpectedPoints = (predictions, pointValues, positions = [1,2,3,4,5,10,20,30,40,50]) => {
  if (!predictions?.baseline) return 0;

  // Sort positions to ensure proper probability calculations
  const sortedPositions = [...positions].sort((a, b) => a - b);

  // Get probabilities for each position (convert from odds to percentages)
  const finishProbabilities = {
    win: (1 / (predictions.baseline.win || 10000)) * 100,
    top_2: (1 / (predictions.baseline.top_2 || 10000)) * 100,
    top_3: (1 / (predictions.baseline.top_3 || 10000)) * 100,
    top_4: (1 / (predictions.baseline.top_4 || 10000)) * 100,
    top_5: (1 / (predictions.baseline.top_5 || 10000)) * 100,
    top_10: (1 / (predictions.baseline.top_10 || 10000)) * 100,
    top_20: (1 / (predictions.baseline.top_20 || 10000)) * 100,
    top_30: (1 / (predictions.baseline.top_30 || 10000)) * 100,
    top_40: (1 / (predictions.baseline.top_40 || 10000)) * 100,
    top_50: (1 / (predictions.baseline.top_50 || 10000)) * 100,
    mc: 1 - (predictions.baseline.make_cut || 0),
  };

  // Map position numbers to their probabilities
  const probabilityMap = {
    1: finishProbabilities.win / 100, // Convert back to decimal for calculations
    2: finishProbabilities.top_2 / 100,
    3: finishProbabilities.top_3 / 100,
    4: finishProbabilities.top_4 / 100,
    5: finishProbabilities.top_5 / 100,
    10: finishProbabilities.top_10 / 100,
    20: finishProbabilities.top_20 / 100,
    30: finishProbabilities.top_30 / 100,
    40: finishProbabilities.top_40 / 100,
    50: finishProbabilities.top_50 / 100,
  };

  let expectedPoints = 0;
  
  // Calculate exact probabilities and points for each position/range
  for (let i = 0; i < sortedPositions.length; i++) {
    const pos = sortedPositions[i];
    
    // Get probability for this position/range
    const currentProb = probabilityMap[pos] || 0;
    const previousProb = i > 0 ? probabilityMap[sortedPositions[i - 1]] || 0 : 0;
    
    // Calculate probability of finishing exactly in this position/range
    const rangeProb = currentProb - previousProb;
    
    // Add expected points for this position/range
    expectedPoints += rangeProb * (pointValues[pos] || 0);
  }

  // Add missed cut points if specified in pointValues
  if ('MC' in pointValues) {
    expectedPoints += finishProbabilities.mc * pointValues.MC;
  }

  // Round to nearest tenth before returning
  return (Math.round(expectedPoints * 10) / 10).toFixed(1);
};

/**
 * Default point values for standard scoring
 */
export const DEFAULT_POINT_VALUES = {
  1: 100,
  2: 75,
  3: 60,
  4: 50,
  5: 40,
  10: 30,
  20: 25,
  30: 20,
  40: 15,
  50: 10,
  200: 5,
  "CUT": 0,
  "WD":0,
  "DQ":0,
  "MC":0,
};
