import React, { useState, useEffect, useMemo, memo } from "react";
import { AutoSizer, MultiGrid, InfiniteLoader } from "react-virtualized";
import { motion, AnimatePresence } from "framer-motion";
import "react-virtualized/styles.css";
import Image from "next/image";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import TableViewSelector from "@/app/components/drop-down/table-view";
import { getCountryCode, createFlagUrlMap } from "@/utils/countryUtils";
import { calculateExpectedPoints, DEFAULT_POINT_VALUES } from '@/utils/pointCalculator';


const HEADER_HEIGHT = 24;
const ROW_HEIGHT = 40;

const PHOTO_WIDTH = 40;
const PHOTO_MIN_WIDTH = 40;

const NAME_MIN_WIDTH = 100;

const PROJ_PTS_WIDTH = 80;
const PROJ_PTS_MIN_WIDTH = 80;

const FIT_WIDTH = 60;
const FIT_MIN_WIDTH = 60;

const SKILL_WIDTH = 50;
const SKILL_MIN_WIDTH = 50;

const PREDICTION_WIDTH = 55;
const PREDICTION_MIN_WIDTH = 55;

const VIEWS = {
  basic: {
    id: "basic",
    label: "Basic Info",
    shortLabel: "Basic",
    columns: [
      {
        key: "photo",
        label: "",
        width: PHOTO_WIDTH,
        minWidth: PHOTO_MIN_WIDTH,
      },
      { key: "name", label: "", minWidth: NAME_MIN_WIDTH, sortable: true },
      {
        key: "owgrRank",
        label: "OWGR",
        width: 60,
        minWidth: 60,
        sortable: true,
      },
      {
        key: "projectedPoints",
        label: "Proj. Pts.",
        width: PROJ_PTS_WIDTH,
        minWidth: PROJ_PTS_MIN_WIDTH,
        sortable: true,
      },
    ],
  },
  courseFit: {
    id: "courseFit",
    label: "Course Fit",
    shortLabel: "Course",
    columns: [
      {
        key: "photo",
        label: "",
        width: PHOTO_WIDTH,
        minWidth: PHOTO_MIN_WIDTH,
      },
      { key: "name", label: "", minWidth: NAME_MIN_WIDTH, sortable: true },
      {
        key: "courseHistory",
        label: "Hist",
        width: FIT_WIDTH,
        minWidth: FIT_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "courseFit",
        label: "Fit",
        width: FIT_WIDTH,
        minWidth: FIT_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "totalFit",
        label: "Total",
        width: FIT_WIDTH,
        minWidth: FIT_MIN_WIDTH,
        sortable: true,
      },
    ],
  },
  predictions: {
    id: "predictions",
    label: "Finish Predictions",
    shortLabel: "Finish",
    columns: [
      {
        key: "photo",
        label: "",
        width: PHOTO_WIDTH,
        minWidth: PHOTO_MIN_WIDTH,
      },
      { key: "name", label: "", minWidth: NAME_MIN_WIDTH, sortable: true },
      {
        key: "winPred",
        label: "Win",
        width: PREDICTION_WIDTH,
        minWidth: PREDICTION_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "top10Pred",
        label: "Top 10",
        width: PREDICTION_WIDTH,
        minWidth: PREDICTION_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "top30Pred",
        label: "Top 30",
        width: PREDICTION_WIDTH,
        minWidth: PREDICTION_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "missCutPred",
        label: "MC",
        width: PREDICTION_WIDTH,
        minWidth: PREDICTION_MIN_WIDTH,
        sortable: true,
      },
    ],
  },
  skillRatings: {
    id: "skillRatings",
    label: "Skill Ratings",
    shortLabel: "Skill",
    columns: [
      {
        key: "photo",
        label: "",
        width: PHOTO_WIDTH,
        minWidth: PHOTO_MIN_WIDTH,
      },
      { key: "name", label: "", minWidth: NAME_MIN_WIDTH, sortable: true },
      {
        key: "driving",
        label: "DRV",
        width: SKILL_WIDTH,
        minWidth: SKILL_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "approach",
        label: "APP",
        width: SKILL_WIDTH,
        minWidth: SKILL_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "shortGame",
        label: "AtG",
        width: SKILL_WIDTH,
        minWidth: SKILL_MIN_WIDTH,
        sortable: true,
      },
      {
        key: "putting",
        label: "PUTT",
        width: SKILL_WIDTH,
        minWidth: SKILL_MIN_WIDTH,
        sortable: true,
      },
    ],
  },
};

const SORT_DIRECTIONS = {
  // Columns that should sort ascending (low to high) first
  ASCENDING_FIRST: ['dgRank', 'owgrRank'],
  // Columns that should sort descending (high to low) first
  DESCENDING_FIRST: ['projectedPoints', 'winPred', 'top10Pred', 'top30Pred', 'missCutPred', 
                     'driving', 'approach', 'shortGame', 'putting', 'courseHistory', 'courseFit', 'totalFit']
};

const RATING_FIELDS = ["courseHistory", "courseFit", "totalFit"];

const getGolferPhotoUrl = async (datagolf_id) => {
  if (!datagolf_id) {
    return "/portrait_placeholder_75.png";
  }

  try {
    const storage = getStorage();
    const photoRef = ref(
      storage,
      `headshots/thumbnails/${datagolf_id}_headshot_100x100.png`
    );
    const url = await getDownloadURL(photoRef);
    return url;
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log(
        `Valid golfer ID ${datagolf_id} but no photo found in storage`
      );
    }
    return "/portrait_placeholder_75.png";
  }
};

const getRatingSymbol = (value, allValues) => {
  if (!allValues.length) return "=";
  console.log("calculating.");
  // Sort values and remove nulls/undefined
  const sortedValues = allValues
    .filter((v) => v !== null && v !== undefined)
    .sort((a, b) => a - b);

  // Calculate statistics
  const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;
  const stdDev = Math.sqrt(
    sortedValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      sortedValues.length
  );

  // Define thresholds using standard deviations
  const extremeThreshold = 2 * stdDev;
  const q20 = sortedValues[Math.floor(sortedValues.length * 0.2)];
  const q40 = sortedValues[Math.floor(sortedValues.length * 0.4)];
  const q60 = sortedValues[Math.floor(sortedValues.length * 0.6)];
  const q80 = sortedValues[Math.floor(sortedValues.length * 0.8)];

  // Extreme cases (beyond 2 standard deviations)
  if (value > mean + extremeThreshold) return "+++";
  if (value < mean - extremeThreshold) return "---";

  // Regular quintile-based rating
  if (value >= q80) return "++";
  if (value >= q60) return "+";
  if (value >= q40) return "=";
  if (value >= q20) return "-";
  return "--";
};

const formatValue = (key, value, allData) => {
  // For course fit ratings, use the rating system
  if (["courseHistory", "courseFit", "totalFit"].includes(key)) {
    const allValues = allData.map((item) => item[key]);
    return getRatingSymbol(value, allValues);
  }

  // For model predictions, use 1/x * 100 formula with superscript %
  if (["winPred", "top10Pred", "top30Pred", "missCutPred"].includes(key)) {

    if (!value || value === 0) value = 10000; 
    const percentage = ((1 / value) * 100).toFixed(1);
    return (
      <div className="whitespace-nowrap tracking-tighter">
        {percentage}
        <sup className="text-[8px] ml-[1px]">%</sup>
      </div>
    );
  }

  // For skill ratings, show 2 decimal places
  if (
    ["totalStrokes", "driving", "approach", "shortGame", "putting"].includes(
      key
    )
  ) {
    return value.toFixed(2);
  }

  return value;
};

const getRatingColor = (rating) => {
  switch (rating) {
    case "+++":
      return "text-green-400 font-bold";
    case "++":
      return "text-green-400";
    case "+":
      return "text-green-400/70";
    case "=":
      return "text-white/70";
    case "-":
      return "text-red-400/70";
    case "--":
      return "text-red-400";
    case "---":
      return "text-red-400 font-bold";
    default:
      return "text-white/70";
  }
};

const formatName = (fullName) => {
  const parts = fullName.split(", ");
  const lastName = parts[0]; // First part is last name
  const firstName = parts[1] || ""; // Second part is first name (or empty if no comma)

  // Add comma to last name
  const formattedLastName = lastName ? lastName + "," : "";

  return { lastName: formattedLastName, firstName };
};

const getColumnWidth = ({ index, columns, containerWidth = 0 }) => {
  if (!columns || !columns.length) return 100;

  const column = columns[index];
  if (!column) return 100;

  if (column.key === "name") {
    // Calculate total width of other columns
    const otherColumnsWidth = columns.reduce((total, col) => {
      // Make sure we count minWidth when width is not specified
      if (col.key !== "name") {
        return total + (col.width || col.minWidth);
      }
      return total;
    }, 0);

    // Name column gets remaining width, but not less than minimum
    return Math.max(containerWidth - otherColumnsWidth, NAME_MIN_WIDTH);
  }

  return column.width || column.minWidth;
};

// Add a function to track loaded photos
const isPhotoLoaded = ({ index, photoUrls, sortedData }) => {
  const item = sortedData[index - 1];
  return item ? photoUrls[item.id] !== undefined : true;
};

// Add a function to load photos
const loadMorePhotos = async ({
  startIndex,
  stopIndex,
  sortedData,
  setPhotoUrls,
}) => {
  const rowsToLoad = [];
  for (let i = startIndex; i <= stopIndex; i++) {
    const item = sortedData[i - 1];
    if (item?.id) {
      rowsToLoad.push(item.id);
    }
  }

  const photoPromises = rowsToLoad.map(async (id) => {
    const url = await getGolferPhotoUrl(id);
    return { id, url };
  });

  const loadedPhotos = await Promise.all(photoPromises);

  setPhotoUrls((prev) => {
    const updates = {};
    loadedPhotos.forEach(({ id, url }) => {
      if (url) updates[id] = url;
    });
    return { ...prev, ...updates };
  });
};

// Replace the existing matchesSearchTerms function with this optimized version
const matchesSearchTerms = (name, searchString) => {
  if (!searchString) return true;
  
  // Convert name to lowercase once
  const lowerName = name.toLowerCase();
  
  // Split by comma and trim each term
  const terms = searchString.toLowerCase().split(',');
  
  // Check if any term matches
  return terms.some(term => {
    const trimmedTerm = term.trim();
    return trimmedTerm && lowerName.includes(trimmedTerm);
  });
};

// Add these SVG components at the top of the file
const SortArrows = ({ active, direction }) => (
  <svg 
    viewBox="0 0 12 16"
    className={`w-2 h-3 ${active ? "text-[#BFFF00]" : "text-white/30 group-hover:text-white/50"}`}
    fill="currentColor"
  >
    {direction === "ASC" ? (
      <path d="M6 4l4 4H2z" />
    ) : direction === "DESC" ? (
      <path d="M6 12l4-4H2z" />
    ) : (
      <>
        <path d="M6 3l4 4H2z" opacity={0.5} />
        <path d="M6 13l4-4H2z" opacity={0.5} />
      </>
    )}
  </svg>
);

// Add this component near other cell components
const SkillCell = ({ value, item }) => {
  // Check if golfer has any skill ratings
  const hasAnySkillRatings = item && (
    item.driving !== 0 || 
    item.approach !== 0 || 
    item.shortGame !== 0 || 
    item.putting !== 0 || 
    item.totalStrokes !== 0
  );

  // Get background color based on value
  const getBgColor = (value) => {
    if (!hasAnySkillRatings || value === null || value === undefined) return "bg-transparent";
    
    // For negative values: red to black
    if (value < 0) {
      return "bg-red-900/30";
    }
    
    // For positive values: black to green
    if (value >= 0.8) return "bg-green-700/50";
    if (value >= 0.5) return "bg-green-800/40";
    if (value >= 0.2) return "bg-green-900/30";
    return "bg-transparent";
  };

  // Format the display value
  const getDisplayValue = () => {
    if (!hasAnySkillRatings) return "-";
    return value.toFixed(2);
  };

  return (
    <div className={`w-full h-full flex justify-center items-center ${getBgColor(value)}`}>
      <span className="text-xs font-medium text-white/90">
        {getDisplayValue()}
      </span>
    </div>
  );
};

// Add this function to calculate ratings from the raw field stats
const calculateFieldRatings = (fieldStats) => {
  if (!fieldStats?.players) return {};
  
  const ratings = {};
  
  RATING_FIELDS.forEach(field => {
    // Get all valid values for this field across all players
    const validValues = Object.values(fieldStats.players)
      .map(player => player.course_fit?.[field.replace('courseFit', 'course_fit_adjustment')
                                           .replace('courseHistory', 'course_history_adjustment')
                                           .replace('totalFit', 'total_fit')] || 0)
      .filter(value => value !== null && value !== undefined && value !== 0)
      .sort((a, b) => a - b);

    if (validValues.length === 0) {
      ratings[field] = new Map();
      return;
    }

    // Calculate statistics once
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const stdDev = Math.sqrt(
      validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validValues.length
    );

    // Calculate thresholds once
    const thresholds = {
      extreme: 2 * stdDev,
      q20: validValues[Math.floor(validValues.length * 0.2)],
      q40: validValues[Math.floor(validValues.length * 0.4)],
      q60: validValues[Math.floor(validValues.length * 0.6)],
      q80: validValues[Math.floor(validValues.length * 0.8)]
    };

    // Create a map of value to rating for this field
    const ratingMap = new Map();
    
    Object.entries(fieldStats.players).forEach(([id, player]) => {
      const value = player.course_fit?.[field.replace('courseFit', 'course_fit_adjustment')
                                          .replace('courseHistory', 'course_history_adjustment')
                                          .replace('totalFit', 'total_fit')] || 0;
      
      // Handle null/undefined/0 values
      if (value === null || value === undefined || value === 0) {
        ratingMap.set(id, "=");
        return;
      }

      // Determine rating based on thresholds
      let rating;
      if (value > mean + thresholds.extreme) rating = "+++";
      else if (value < mean - thresholds.extreme) rating = "---";
      else if (value >= thresholds.q80) rating = "++";
      else if (value >= thresholds.q60) rating = "+";
      else if (value >= thresholds.q40) rating = "=";
      else if (value >= thresholds.q20) rating = "-";
      else rating = "--";

      ratingMap.set(id, rating);
    });

    ratings[field] = ratingMap;
  });

  return ratings;
};

/**
 * TableGrid Component
 *
 * A memoized virtualized grid component for displaying golfer data in various
 * views.
 *
 * Memoization is used to optimize performance by preventing unnecessary
 * re-renders, particularly important for virtualized grids handling large
 * datasets with frequent parent state changes (sorting, filtering, view
 * switches).
 *
 * Implements a scrollable react-virtualized multi-grid component that is
 * used to display golfer data in various views.
 *
 * @component
 * @param {Object} props
 * @param {string} props.activeView - Current view ID ('basic', 'courseFit', etc.)
 * @param {number} props.width - Container width provided by AutoSizer
 * @param {number} props.height - Container height provided by AutoSizer
 * @param {Array<Object>} props.columns - Array of column configurations for current view
 * @param {Array<Object>} props.sortedData - Filtered and sorted golfer data
 * @param {Function} props.cellRenderer - Function to render individual grid cells
 *
 * @example
 * <TableGrid
 *   activeView="basic"
 *   width={800}
 *   height={600}
 *   columns={VIEWS.basic.columns}
 *   sortedData={sortedGolferData}
 *   cellRenderer={renderCell}
 * />
 */
const TableGrid = memo(
  ({
    activeView,
    width,
    height,
    columns,
    sortedData,
    cellRenderer,
    photoUrls,
    setPhotoUrls,
  }) => {
    // Add this effect to load photos for visible rows when sortedData changes
    useEffect(() => {
      // Load first visible batch of photos when data order changes
      loadMorePhotos({ 
        startIndex: 0, 
        stopIndex: 20, // Adjust this number based on your needs
        sortedData, 
        setPhotoUrls 
      });
    }, [sortedData, setPhotoUrls]);

    // Split columns into left (photo + name) and right (data) sections
    const leftColumns = columns.slice(0, 2); // photo and name
    const rightColumns = columns.slice(2); // everything else

    // Calculate fixed width of right section
    const rightSectionWidth = rightColumns.reduce(
      (total, col) => total + (col.width || col.minWidth),
      0
    );

    // Left section gets remaining width
    const leftSectionWidth = width - rightSectionWidth;

    return (
      <motion.div
        key={activeView}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width,
          height,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <InfiniteLoader
          isRowLoaded={({ index }) =>
            isPhotoLoaded({ index, photoUrls, sortedData })
          }
          loadMoreRows={({ startIndex, stopIndex }) =>
            loadMorePhotos({ startIndex, stopIndex, sortedData, setPhotoUrls })
          }
          rowCount={sortedData.length + 1}
          threshold={10}
          minimumBatchSize={10}
        >
          {({ onRowsRendered, registerChild }) => (
            <MultiGrid
              ref={registerChild}
              cellRenderer={cellRenderer}
              columnCount={columns.length}
              rowCount={sortedData.length + 1}
              // Fixed dimensions
              fixedColumnCount={2} // photo and name columns
              fixedRowCount={1} // header row
              // Section widths
              width={width}
              height={height}
              // Column widths
              columnWidth={
                ({ index }) =>
                  index < 2
                    ? index === 0
                      ? PHOTO_WIDTH
                      : leftSectionWidth - PHOTO_WIDTH // Left section
                    : rightColumns[index - 2].width // Right section
              }
              // Row heights
              rowHeight={({ index }) =>
                index === 0 ? HEADER_HEIGHT : ROW_HEIGHT
              }
              // Styling for each quadrant
              styleTopLeftGrid={{
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "#1a1a1a",
              }}
              styleTopRightGrid={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "#1a1a1a",
                overflowX: "hidden",
              }}
              styleBottomLeftGrid={{
                borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                overscrollBehavior: "none",
              }}
              styleBottomRightGrid={{
                overflowY: "scroll",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "none",
              }}
              className="outline-none"
              enableFixedColumnScroll={true}
              hideTopRightGridScrollbar={true}
              hideBottomLeftGridScrollbar={true}
              onSectionRendered={({ rowStartIndex, rowStopIndex }) => {
                onRowsRendered({
                  startIndex: rowStartIndex,
                  stopIndex: rowStopIndex,
                });
              }}
            />
          )}
        </InfiniteLoader>
      </motion.div>
    );
  }
);

TableGrid.displayName = 'TableGrid';

const formatRanking = (ranking) => {
  if (!ranking || ranking === 'null' || ranking === 'undefined') return '-';
  return ranking > 500 ? '>500' : ranking;
};

const FilterTable = ({
  fieldStats,
  pickData,
  selectedGolfer,
  onSelectGolfer,
  isLoading,
}) => {
  const [photoUrls, setPhotoUrls] = useState({});
  const [flagUrls, setFlagUrls] = useState({});
  const [sortBy, setSortBy] = useState("owgrRank");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [activeView, setActiveView] = useState("basic");
  const [showOutOfField, setShowOutOfField] = useState(false);
  const [showPreviouslyPicked, setShowPreviouslyPicked] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [isViewChanging, setIsViewChanging] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);

  // Calculate ratings once when field stats load
  const [fieldRatings, setFieldRatings] = useState({});
  
  // Add this near other state variables in FilterTable
  const [ratingThresholds, setRatingThresholds] = useState({});
  
  useEffect(() => {
    if (fieldStats) {
      const ratings = calculateFieldRatings(fieldStats);
      setFieldRatings(ratings);
    }
  }, [fieldStats]);

  // Add this effect to calculate thresholds once when field stats load
  useEffect(() => {
    if (!fieldStats?.players) return;

    const thresholds = {};
    
    ["courseHistory", "courseFit", "totalFit"].forEach(field => {
      // Get all valid values for this field
      const values = Object.values(fieldStats.players)
        .map(player => {
          if (!player.course_fit) return null;
          
          switch(field) {
            case 'courseHistory':
              return player.course_fit.course_history_adjustment;
            case 'courseFit':
              return player.course_fit.course_fit_adjustment;
            case 'totalFit':
              // Only calculate total if both values exist
              const history = player.course_fit.course_history_adjustment;
              const fit = player.course_fit.course_fit_adjustment;
              if (history === null || history === undefined || 
                  fit === null || fit === undefined) return null;
              return history + fit;
            default:
              return null;
          }
        })
        .filter(value => value !== null && value !== undefined) // Remove null/undefined values
        .sort((a, b) => a - b);

      if (values.length === 0) return;

      // Calculate statistics
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
      );

      thresholds[field] = {
        mean,
        stdDev,
        q20: values[Math.floor(values.length * 0.2)],
        q40: values[Math.floor(values.length * 0.4)],
        q60: values[Math.floor(values.length * 0.6)],
        q80: values[Math.floor(values.length * 0.8)]
      };
    });

    setRatingThresholds(thresholds);
  }, [fieldStats, setRatingThresholds]);

  // Handle view changes with a brief loading state
  const handleViewChange = (newView) => {
    setIsViewChanging(true);
    setActiveView(newView);

    requestAnimationFrame(() => {
      setIsViewChanging(false);
    });
  };

  // Create flag URL mapping when data loads
  useEffect(() => {
    if (fieldStats?.players) {
      // Extract unique country codes from players
      const countryCodes = Object.values(fieldStats.players)
        .map((player) => player.bio?.country_code.toUpperCase())
        .filter(Boolean);

      const flagMap = createFlagUrlMap(countryCodes);
      console.log("Flag map:", flagMap);
      setFlagUrls(flagMap);
    }
  }, [fieldStats?.players]);

  // Transform data with all possible fields
  const sortedData = useMemo(() => {
    if (!fieldStats?.players) return [];

    const allPlayers = Object.entries(fieldStats.players).map(([id, data]) => {
      // Get course_fit data or null if not present
      const courseFitData = data.course_fit || null;
      
      // Calculate total fit only if both components exist
      let totalFit = null;
      if (courseFitData?.course_history_adjustment !== null && 
          courseFitData?.course_history_adjustment !== undefined &&
          courseFitData?.course_fit_adjustment !== null && 
          courseFitData?.course_fit_adjustment !== undefined) {
        totalFit = courseFitData.course_history_adjustment + courseFitData.course_fit_adjustment;
      }

      return {
        id,
        name: data.bio?.name || "",
        country: data.bio?.country_code || null,
        dgRank: data.bio?.datagolf_rank || 999,
        owgrRank: data.bio?.owgr_rank || 999,
        isInField: !!data.predictions?.baseline,
        hasBeenPicked: pickData?.golfers?.find((g) => g.id === id)?.has_been_picked || false,
        projectedPoints: calculateExpectedPoints(
          data.predictions, 
          DEFAULT_POINT_VALUES,
          [1, 2, 3, 4, 5, 10, 20, 30, 40, 50]
        ),
        // Course Fit - use null instead of 0 for missing data
        courseHistory: courseFitData?.course_history_adjustment ?? null,
        courseFit: courseFitData?.course_fit_adjustment ?? null,
        totalFit: totalFit,
        // Predictions (all)
        winPred: data.predictions?.baseline?.win || 0,
        top2Pred: data.predictions?.baseline?.top_2 || 0,
        top3Pred: data.predictions?.baseline?.top_3 || 0,
        top4Pred: data.predictions?.baseline?.top_4 || 0,
        top5Pred: data.predictions?.baseline?.top_5 || 0,
        top10Pred: data.predictions?.baseline?.top_10 || 0,
        top20Pred: data.predictions?.baseline?.top_20 || 0,
        top30Pred: data.predictions?.baseline?.top_30 || 0,
        top40Pred: data.predictions?.baseline?.top_40 || 0,
        top50Pred: data.predictions?.baseline?.top_50 || 0,
        missCutPred: 1/(1 - 1/data.predictions?.baseline?.make_cut) || 0,

        // Skill Ratings (all)
        totalStrokes: data.skill_ratings?.values?.sg_total || 0,
        driving: data.skill_ratings?.values?.sg_ott || 0,
        approach: data.skill_ratings?.values?.sg_app || 0,
        shortGame: data.skill_ratings?.values?.sg_arg || 0,
        putting: data.skill_ratings?.values?.sg_putt || 0,
      };
    });

    // Filter based on settings and name
    const filteredPlayers = allPlayers.filter((player) => {
      if (!showOutOfField && !player.isInField) return false;
      if (!showPreviouslyPicked && player.hasBeenPicked) return false;
      if (nameFilter && !matchesSearchTerms(player.name, nameFilter))
        return false;
      return true;
    });

    return filteredPlayers.sort((a, b) => {
      // Special handling for name sorting
      if (sortBy === "name") {
        return sortDirection === "ASC" ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      }

      // Get values, treating 0 as null for prediction fields
      const aVal = ["winPred", "top10Pred", "top30Pred", "missCutPred"].includes(sortBy) ? 
        (a[sortBy] || null) : 
        (a[sortBy] ?? null);
      const bVal = ["winPred", "top10Pred", "top30Pred", "missCutPred"].includes(sortBy) ? 
        (b[sortBy] || null) : 
        (b[sortBy] ?? null);

      // If either value is null/undefined, move it to the bottom
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Normal sorting for non-null values
      const multiplier = sortDirection === "ASC" ? 1 : -1;
      return multiplier * (aVal - bVal);
    });
  }, [
    fieldStats,
    pickData,
    sortBy,
    sortDirection,
    showOutOfField,
    showPreviouslyPicked,
    nameFilter,
  ]);

  // Load golfer photos
  useEffect(() => {
    if (!selectedGolfer) return;

    const loadPhotos = async () => {
      // Get active golfers sorted by OWGR
      const activeGolfers = Object.entries(fieldStats.players)
        .filter(([_, data]) => !!data.predictions?.baseline)
        .map(([id, data]) => ({
          id,
          owgrRank: data.bio?.owgr_rank || 999,
        }))
        .sort((a, b) => (a.owgrRank || 999) - (b.owgrRank || 999))
        .slice(0, 20); // Only take top 20

      // Load photos for top 20 active golfers
      for (const golfer of activeGolfers) {
        if (!photoUrls[golfer.id]) {
          const url = await getGolferPhotoUrl(golfer.id);
          setPhotoUrls((prev) => ({ ...prev, [golfer.id]: url }));
        }
      }

      // Load photos for any specifically selected golfer not in top 20
      if (selectedGolfer && !photoUrls[selectedGolfer.id]) {
        const url = await getGolferPhotoUrl(selectedGolfer.id);
        setPhotoUrls((prev) => ({ ...prev, [selectedGolfer.id]: url }));
      }
    };

    loadPhotos();
  }, [selectedGolfer, fieldStats, photoUrls, setPhotoUrls]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterDropdown = event.target.closest(".filter-dropdown");
      if (showFilters && !filterDropdown) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // Update renderFitCell to use the thresholds
  const renderFitCell = (key, value, item) => {
    if (value === null) {
      return (
        <div className="text-center">
          <span className="text-gray-500">&ldquo;N/A&rdquo;</span>
        </div>
      );
    }

    let rating;
    if (ratingThresholds[key]) {
      const { mean, stdDev, q20, q40, q60, q80 } = ratingThresholds[key];
      
      if (value > mean + (2 * stdDev)) rating = "+++";
      else if (value < mean - (2 * stdDev)) rating = "---";
      else if (value >= q80) rating = "++";
      else if (value >= q60) rating = "+";
      else if (value >= q40) rating = "=";
      else if (value >= q20) rating = "-";
      else rating = "--";
    }

    return (
      <div className="text-center">
        <span className={`text-sm ${getRatingColor(rating)}`}>{rating}</span>
        <span className="text-[9px] text-white/30">{value.toFixed(3)}</span>
      </div>
    );
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const columns = VIEWS[activeView].columns;
    const column = columns[columnIndex];

    // Calculate the exact width for this column
    const columnWidth = getColumnWidth({
      index: columnIndex,
      columns,
      containerWidth: 800,
    });

    // Modify the style to ensure consistent widths
    const cellStyle = {
      ...style,
      width: columnWidth,
      minWidth: columnWidth,
      maxWidth: columnWidth,
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      borderRight:
        columnIndex < columns.length - 1 && column.key !== "photo"
          ? "1px solid rgba(255, 255, 255, 0.03)"
          : "none",
    };

    // Header row
    if (rowIndex === 0) {
      return (
        <div
          key={key}
          style={{
            ...cellStyle,
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            justifyContent: "flex-start",
          }}
          className={`
            flex select-none
            ${column.sortable ? "cursor-pointer group" : ""}
            ${sortBy === "name" ? "bg-white/5" : "hover:bg-white/5"}
          `}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          {column.key === "photo" ? (
            <div /> // Empty photo column header
          ) : column.key === "name" ? (
            <div className="flex pl-1">
              <span className="w-2 flex items-center">
                <SortArrows 
                  active={sortBy === "name"} 
                  direction={sortBy === "name" ? sortDirection : null} 
                />
              </span>
              <span className="text-white/50 text-[10px] uppercase tracking ml-0.5">
                Golfer
              </span>
            </div>
          ) : (
            <div className="flex pl-1">
              <span className="w-2 flex items-center">
                <SortArrows 
                  active={sortBy === column.key} 
                  direction={sortBy === column.key ? sortDirection : null}
                />
              </span>
              <span className="text-white/50 text-[10px] uppercase tracking ml-0.5">
                {column.label}
              </span>
            </div>
          )}
        </div>
      );
    }

    // Data rows
    const item = sortedData[rowIndex - 1];
    if (!item) return null;

    
    const isSelected = selectedGolfer?.id === item.id;

    return (
      <div
        key={key}
        style={{
          ...cellStyle,
          backgroundColor: isSelected
            ? "rgba(255, 255, 255, 0.05)"
            : "transparent",
          opacity: !item.isInField || item.hasBeenPicked ? 0.5 : 1,
          borderTop: isSelected ? "1px solid #BFFF00" : "none",
          borderBottom: isSelected
            ? "1px solid #BFFF00"
            : "1px solid rgba(255, 255, 255, 0.05)",
          justifyContent: "flex-start",
        }}
        onClick={() => onSelectGolfer(item)}
        className={`
          hover:bg-white/5 transition-colors duration-150 font-[Verdana]
          ${column.key === "photo" ? "justify-center" : ""} 
        `}
      >
        {column.key === "photo" ? (
          <div className="relative w-full h-full overflow-hidden px-4">
            <Image
              src={photoUrls[item.id] || "/portrait_placeholder_75.png"}
              alt={`${item.first_name} ${item.last_name}`}
              width={PHOTO_WIDTH}
              height={PHOTO_WIDTH}
              className="rounded-full object-cover"
              unoptimized
            />
            {/* Flag overlay */}
            {item.country && flagUrls[item.country] && (
              <div className="absolute bottom-0 left-0 h-3 w-4 m-[1px]">
                <Image
                  src={flagUrls[item.country]}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  onError={(e) =>
                    console.log("Flag load error for country:", item.country)
                  }
                />
              </div>
            )}
          </div>
        ) : column.key === "name" ? (
          <div
            className="flex flex-col justify-center w-full overflow-hidden"
            style={{
              maxWidth: columnWidth - 8, // Still need this for width calculation
            }}
          >
            <div className="w-full overflow-hidden">
              <span className="text-white text-xs font-medium block truncate">
                {formatName(item[column.key]).lastName}
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <span className="text-[10px] text-white/40 block truncate italic">
                {formatName(item[column.key]).firstName}
                {item.hasBeenPicked && (
                  <span className="ml-1 not-italic">(previously picked)</span>
                )}
              </span>
            </div>
          </div>
        ) : column.key === "owgrRank" ? (
          <div className="w-full flex justify-center">
            <span className="text-white/70 text-xs">
              {formatRanking(item[column.key])}
            </span>
          </div>
        ): ["driving", "approach", "shortGame", "putting", "totalStrokes"].includes(column.key) ? (
          <SkillCell value={item[column.key]} item={item} />
        ) : ["courseHistory", "courseFit", "totalFit"].includes(column.key) ? (
          renderFitCell(column.key, item[column.key], item)
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-white/70 text-xs">
              {formatValue(column.key, item[column.key], sortedData)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      // Set new sort column with appropriate initial direction
      setSortBy(columnKey);
      if (SORT_DIRECTIONS.ASCENDING_FIRST.includes(columnKey)) {
        setSortDirection("ASC");
      } else if (SORT_DIRECTIONS.DESCENDING_FIRST.includes(columnKey)) {
        setSortDirection("DESC");
      } else {
        // Default to ascending for any other columns (like name)
        setSortDirection("ASC");
      }
    }
  };

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoadingMessage(true);
      }, 2000); // Show message after 2 seconds
    } else {
      setShowLoadingMessage(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="w-full h-full flex flex-col select-none">
      <div className="px-2 py-2 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search golfers..."
              className="bg-[#1a1a1a] text-white/70 text-[16px] px-3 py-1 rounded border border-white/10 
                         hover:border-white/20 focus:outline-none focus:border-[#BFFF00] w-48"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
            />
            <div className="relative filter-dropdown flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowFilters(!showFilters);
                }}
                className={`
                  p-1.5 rounded border
                  transition-colors duration-150
                  ${
                    showFilters
                      ? "bg-[#BFFF00]/10 border-[#BFFF00] text-[#BFFF00]"
                      : "border-white/10 text-white/70 hover:border-white/20"
                  }
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>

              {showFilters && (
                <div
                  className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 
                             rounded shadow-lg py-2 px-3 whitespace-nowrap z-10"
                >
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showOutOfField}
                        onChange={(e) => {
                          e.stopPropagation(); // Stop event from bubbling up
                          setShowOutOfField(e.target.checked);
                        }}
                        className="form-checkbox h-4 w-4 rounded border-white/10 
                                 text-[#BFFF00] focus:ring-[#BFFF00] focus:ring-opacity-50
                                 bg-black"
                      />
                      Show All Golfers
                    </label>

                    <label className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showPreviouslyPicked}
                        onChange={(e) => {
                          e.stopPropagation(); // Stop event from bubbling up
                          setShowPreviouslyPicked(e.target.checked);
                        }}
                        className="form-checkbox h-4 w-4 rounded border-white/10 
                                 text-[#BFFF00] focus:ring-[#BFFF00] focus:ring-opacity-50
                                 bg-black"
                      />
                      Show Previously Picked
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          <TableViewSelector
            views={VIEWS}
            activeView={activeView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BFFF00]" />
            {showLoadingMessage && (
              <span className="mt-4 text-white text-sm">
                Getting updated field, please wait...
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full"
              >
                <AutoSizer>
                  {({ width, height }) => (
                    <TableGrid
                      activeView={activeView}
                      width={width}
                      height={height}
                      columns={VIEWS[activeView].columns}
                      sortedData={sortedData}
                      cellRenderer={cellRenderer}
                      photoUrls={photoUrls}
                      setPhotoUrls={setPhotoUrls}
                    />
                  )}
                </AutoSizer>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Debug Section */}
      <div className="border-t border-white/10 p-4">
        {/* Pro tip - now inside the debug section div but before details */}
        <span className="text-[10px] text-white/30 block mb-4">
          Pro tip: Use commas to compare multiple golfers (i.e. &quot;Spieth, Rahm&quot;)
        </span>

        <details className="text-white/50 text-xs">
          <summary className="cursor-pointer hover:text-white/70">
            Debug: DD API Response
          </summary>
          <pre className="mt-2 overflow-auto max-h-48">
            {JSON.stringify(pickData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default FilterTable;
