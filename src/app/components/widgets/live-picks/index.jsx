import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useLeague } from "../../league-context";
import Image from "next/image";
import { formatTournamentName } from "../../../utils/formatTournamentName";
import "./live-picks-styles.css";
import { Tooltip } from "react-tooltip";
import { CutLineRow, getCutLines } from './cut-line';
import { GolferCell } from './dynamic-cells';

const GOLFER_WIDTH = "w-[100px] self-center";
const SCORE_WIDTH = "pt-2 min-w-[30px] max-w-[35px] px-1 text-[10px]";
const PROJECTION_WIDTH = "w-[35px] tracking-tight";
const SG_WIDTH = "min-w-[40px] max-w-[45px] self-center tracking-tight";
const USERS_WIDTH = "w-full max-w-[100px]";

const TableHeader = ({ round = "#" }) => (
  <thead>
    <tr className="h-12 bg-black/40 text-xs text-white/50 uppercase tracking-wider border-b border-gray-400">
      {/* Score Group */}
      <th className={`text-right px-2 ${GOLFER_WIDTH}`}>
        <div className="mt-4">Golfer</div>
      </th>
      <th className={`border-l border-gray-400 ${SCORE_WIDTH}`}>
        <div className="mt-4">Pos</div>
      </th>
      <th className={`py-0.5 ${SCORE_WIDTH}`}>
        <div className="mt-4">Tot</div>
      </th>
      <th className={`${SCORE_WIDTH}`}>
        <div className="mt-4">R{round}</div>
      </th>
      <th className={`px-1 py-0.5 border-r border-gray-400 ${SCORE_WIDTH}`}>
        <div className="mt-4">Thru</div>
      </th>

      {/* Projections Group */}
      <th className="border-x border-gray-400" colSpan={4}>
        <div className="text-center mb-1.5">Projections</div>
        <div className="flex text-[10px]">
          <div className={`text-center ${PROJECTION_WIDTH}`}>Pts.</div>
          <div className={`text-center ${PROJECTION_WIDTH}`}>Win</div>
          <div className={`text-center ${PROJECTION_WIDTH}`}>Top 5</div>
          <div className={`text-center ${PROJECTION_WIDTH}`}>MC</div>
        </div>
      </th>

      {/* Strokes Gained Group */}
      <th className="border-x border-gray-400" colSpan={5}>
        <div className="text-center mb-2">Strokes Gained</div>
        <div className="flex text-[10px]">
          <div className={`px-1 text-center ${SG_WIDTH}`}>Putt</div>
          <div className={`px-1 text-center ${SG_WIDTH}`}>ARG</div>
          <div className={`px-1 text-center ${SG_WIDTH}`}>APP</div>
          <div className={`px-1 text-center ${SG_WIDTH}`}>OTT</div>
          <div className={`px-1 text-center ${SG_WIDTH}`}>Tot.</div>
        </div>
      </th>

      {/* Users Group */}
      <th className={`px-1 py-0.5 text-left ${USERS_WIDTH}`}>
        <div className="mt-4">Users</div>
      </th>
    </tr>
  </thead>
);

const UserAvatar = ({ user }) => (
  <div className="relative" title={user?.name}>
    <Image
      src={user?.avatar_url || "/portrait_placeholder_75.png"}
      alt={user?.name || "Unknown User"}
      width={24}
      height={24}
      className="inline-block h-6 w-6 rounded-full ring-1 ring-white/40 bg-gray-500"
    />
  </div>
);

const UserAvatarStack = ({ users, isLoading, rowIndex, totalRows }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setIsTooltipOpen(false);
    };

    if (isTooltipOpen) {
      document.addEventListener("click", handleGlobalClick);
    }

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [isTooltipOpen]);

  if (isLoading)
    return <div className="animate-pulse bg-white/10 h-6 w-24 rounded" />;
  if (!users?.length) return null;

  const tooltipId = `users-${users
    .map((u) => `${u.id}-${u.first_name}-${u.last_name}`)
    .join("-")}`;

  let tooltipPlacement;
  if (rowIndex <= 1) {
    tooltipPlacement = "left-start";
  } else if (rowIndex >= totalRows - 2) {
    tooltipPlacement = "left-end";
  } else {
    tooltipPlacement = "left";
  }

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent immediate closure
    setIsTooltipOpen(!isTooltipOpen);
  };

  return (
    <>
      <div
        className="flex -space-x-2 cursor-pointer"
        data-tooltip-id={tooltipId}
        id={`anchor-${tooltipId}`}
        onClick={handleClick}
      >
        {users.map((user, i) => (
          <div key={`${user.id}-${i}`} className={`${i === 0 ? "ml-0.5" : ""}`}>
            <UserAvatar user={user} />
          </div>
        ))}
      </div>
      <Tooltip
        style={{ backgroundColor: "Black", color: "#aaa", height: "auto", padding: "0.25rem", zIndex: 1000000 }}
        opacity={1}

        id={tooltipId}
        place={tooltipPlacement}
    
        
        anchorSelect={`#anchor-${tooltipId}`}
        isOpen={isTooltipOpen}
        openOnClick={false}
        openOnHover={false}
        render={({ content }) => (
          <div className="py-0.5 bg-opacity-100">
            {users.map((user, i) => (
              <div
                key={i}
                className="align-right px-1 py-0.5 whitespace-nowrap text-xs leading-tight"
              >
                {`${user.first_name} ${user.last_name}`}
              </div>
            ))}
          </div>
        )}
      ></Tooltip>
    </>
  );
};

const getProjectedPointsColor = (points) => {
  if (!points && points !== 0) return "";

  // Define our color stops
  const colorStops = [
    { points: 50, r: 239, g: 68, b: 68 }, // red-500
    { points: 25, r: 249, g: 115, b: 22 }, // orange-500
    { points: 5, r: 0, g: 0, b: 0 }, // black
    { points: 0, r: 37, g: 99, b: 235 }, // blue-600
  ];

  // Find the two colors to interpolate between
  let lower = colorStops[colorStops.length - 1];
  let upper = colorStops[0];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (points <= colorStops[i].points && points > colorStops[i + 1].points) {
      upper = colorStops[i];
      lower = colorStops[i + 1];
      break;
    }
  }

  // Calculate the percentage between the two color stops
  const range = upper.points - lower.points;
  const percent = range === 0 ? 1 : (points - lower.points) / range;

  // Interpolate between the colors
  const r = Math.round(lower.r + (upper.r - lower.r) * percent);
  const g = Math.round(lower.g + (upper.g - lower.g) * percent);
  const b = Math.round(lower.b + (upper.b - lower.b) * percent);

  return `rgba(${r}, ${g}, ${b}, 0.25)`;
};

const getStatRankColor = (rank, fieldSize) => {
  if (!rank || !fieldSize) return "";

  // Define our color stops
  const colorStops = [
    { rank: 1, r: 34, g: 197, b: 94 }, // green-500
    { rank: Math.ceil(fieldSize / 2), r: 0, g: 0, b: 0 }, // black (midpoint)
    { rank: fieldSize, r: 239, g: 68, b: 68 }, // red-500
  ];

  let lower = colorStops[0];
  let upper = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (rank >= colorStops[i].rank && rank <= colorStops[i + 1].rank) {
      lower = colorStops[i];
      upper = colorStops[i + 1];
      break;
    }
  }

  const range = upper.rank - lower.rank;
  const percent = range === 0 ? 1 : (rank - lower.rank) / range;

  const r = Math.round(lower.r + (upper.r - lower.r) * percent);
  const g = Math.round(lower.g + (upper.g - lower.g) * percent);
  const b = Math.round(lower.b + (upper.b - lower.b) * percent);

  return `rgba(${r}, ${g}, ${b}, 0.25)`;
};

const formatOrdinal = (n) => {
  if (!n) return "-";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];
  return (
    <>
      {n}
      <span className="text-[8px] align-super">{suffix}</span>
    </>
  );
};

const formatStatValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (value > 0) {
    return (
      <>
        <span className="text-[8px] mt-[2px]">+</span>
        {value.toFixed(2)}
      </>
    );
  }
  return value.toFixed(2);
};

const StatCell = ({
  stat,
  fieldSize,
  showRanks = true,
  borderRight = false,
  isCut = false
}) => {
  if (isCut) {
    return (
      <td className={`px-1 py-0.5 text-center whitespace-nowrap border-l border-white/5 ${
        borderRight ? "border-r border-gray-800 " : ""
      } w-[50px]`}>
        <span className="text-xs text-white/70">-</span>
      </td>
    );
  }
  
  return (
    <td
      className={`px-1 py-0.5 text-center whitespace-nowrap border-l border-white/5 ${
        borderRight ? "border-r border-gray-800 " : ""
      } w-[50px]`}
      style={{ backgroundColor: getStatRankColor(stat?.rank, fieldSize) }}
    >
      <div className="flex flex-col items-center">
        <span className="text-xs text-white/70 w-full tracking-tighter">
          {showRanks ? formatOrdinal(stat?.rank) : formatStatValue(stat?.value)}
        </span>
      </div>
    </td>
  );
};

const formatProjectionValue = (value, thru) => {
  if (thru >= 18 && (value === null || value === undefined)) {
    return (
      <>
        0<span className="text-[8px] mt-[2px]">%</span>
      </>
    );
  }
  if (value === null || value === undefined) return "-";
  return (
    <>
      {Math.min(100, Math.round(value))}
      <span className="text-[8px] mt-[2px]">%</span>
    </>
  );
};

const ProjectionCell = ({ value, thru, borderRight = false }) => (
  <td
    className={`px-1 py-0.5 text-center whitespace-nowrap border-l border-white/5 ${
      borderRight ? "border-r border-gray-400" : ""
    } w-[40px]`}
  >
    <span className="text-xs text-white/70 tracking-tighter">
      {formatProjectionValue(value, thru)}
    </span>
  </td>
);

const formatProjectedPoints = (points) => {
  if (points === null || points === undefined) return "-";
  return points.toFixed(1);
};

const ProjectedPointsCell = ({ points, actualPoints, borderRight = false }) => (
  <td
    className={`px-1 py-0.5 text-center whitespace-nowrap border-l border-white/5 ${
      borderRight ? "border-r-2 border-gray-400 border" : ""
    } w-[45px]`}
    style={{ backgroundColor: getProjectedPointsColor(actualPoints ?? points) }}
  >
    <span className="text-xs text-white/70 tracking-tighter">
      {actualPoints !== undefined && actualPoints !== null 
        ? actualPoints.toFixed(1)  // Show actual points if available
        : formatProjectedPoints(points)} 
    </span>
  </td>
);

const formatPosition = (position) => {
  if (!position || position === "WAITING") return "-";
  if (position.startsWith("T")) {
    return (
      <>
        <span className="text-[10px] mr-[1px]">T</span>
        {position.substring(1)}
      </>
    );
  }
  return position;
};

const TableRow = ({
  golfer,
  isLoading,
  rowIndex,
  totalRows,
  cutLine,
  currentRound,
  fieldSize,
  showRanks,
}) => {
  if (isLoading) {
    return (
      <tr className="animate-pulse">
        <td className={`px-1 py-0.5 ${GOLFER_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-32"></div>
        </td>
        <td className={`px-1 py-0.5 ${SCORE_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-8 mx-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SCORE_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SCORE_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SCORE_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-full ml-auto"></div>
        </td>
        <td className={`py-0.5 ${PROJECTION_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-full ml-auto"></div>
        </td>
        <td className={` py-0.5 ${PROJECTION_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-full ml-auto"></div>
        </td>
        <td className={` py-0.5 ${PROJECTION_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={` py-0.5 ${PROJECTION_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SG_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SG_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SG_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SG_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td className={`px-1 py-0.5 ${SG_WIDTH}`}>
          <div className="h-6 bg-white/10 rounded w-12 ml-auto"></div>
        </td>
        <td
          className={`px-3 py-0.5 whitespace-nowrap border-l border-gray-400 ${USERS_WIDTH}`}
        >
          <UserAvatarStack
            users={golfer?.users}
            isLoading={true}
            rowIndex={rowIndex}
            totalRows={totalRows}
          />
        </td>
      </tr>
    );
  }

  const isCut = golfer?.position === "CUT" || golfer?.position === "WD" || golfer?.position === "DNP";
  const isCutLine = cutLine && golfer.total_score === cutLine.score;

  const displayThru = () => {
    if (golfer?.thru === 18) {
      const roundKey = `R${currentRound}`;
      const roundScore = golfer?.[roundKey];
      if (roundScore !== null && roundScore !== undefined) {
        return roundScore;
      }
    }
    
    // Only show asterisk if they've started and finished on a hole other than 18
    return `${golfer?.thru || "-"}${
      golfer?.thru && golfer?.end_hole && golfer.end_hole !== 18 ? "*" : ""
    }`;
  };

  return (
    <tr
      className={`
        hover:bg-white/5 
        border-b 
        font-['Verdana']
        ${isCutLine ? "border-yellow-500/50 border-b-2" : "border-white/5"}
        ${isCut ? "opacity-40" : ""}
      `}
    >
      {/* Score Group */}
      <td
        className={`py-0.5 text-right whitespace-nowrap ${GOLFER_WIDTH}`}
      >
        <GolferCell golfer={golfer} isLoading={isLoading} />
      </td>

      {/*  Golfer Position Row */}
      <td
        className={`py-0.5 text-center whitespace-nowrap border-l border-white/5 ${SCORE_WIDTH}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs text-white/70">
            {formatPosition(golfer?.position)}
          </span>
          {isCutLine && (
            <span className="text-[10px] text-yellow-500">Cut Line</span>
          )}
        </div>
      </td>

      {/* Total Score Row */}
      <td
        className={`py-0.5 text-center whitespace-nowrap border-l border-white/5 ${SCORE_WIDTH} ${
          (golfer?.total_score ?? 1) < 0 ? "bg-red-500/10" : ""
        }`}>
        <span className="text-xs text-white/70">
          {isCut ? "-" : golfer?.total_score === 0
            ? "E"
            : golfer?.total_score > 0
            ? `+${golfer.total_score}`
            : golfer?.total_score || "-"}
        </span>
      </td>

      {/* Round Score Row */}
      <td
        className={`py-0.5 text-center whitespace-nowrap border-l border-white/5 ${SCORE_WIDTH} ${
          (golfer?.round_score ?? 1) < 0 ? "bg-red-500/10" : ""
        }`}
      >
        <span className="text-xs text-white/70">
          {golfer?.round_score === 0
            ? "E"
            : golfer?.round_score > 0
            ? `+${golfer.round_score}`
            : golfer?.round_score || "-"}
        </span>
      </td>

      {/* Thru Holes Row */}
      <td
        className={`py-0.5 text-center whitespace-nowrap border-l border-white/5 border-r border-gray-400 ${SCORE_WIDTH}`}
      >
        <span className="text-xs text-white/70">
          {displayThru()}
        </span>
      </td>

      {/* Projections Group */}
      <ProjectedPointsCell
        points={golfer?.expectedPoints}
        borderRight={false}
      />
      <ProjectionCell value={golfer?.win} thru={golfer?.thru} />
      <ProjectionCell value={golfer?.top5} thru={golfer?.thru} />
      <ProjectionCell
        value={golfer?.miss_cut}
        thru={golfer?.thru}
        borderRight={true}
      />

      {/* Strokes Gained Group */}
      <StatCell
        stat={golfer?.stats?.sg_putt}
        fieldSize={fieldSize}
        showRanks={showRanks}
        isCut={isCut}
      />
      <StatCell
        stat={golfer?.stats?.sg_arg}
        fieldSize={fieldSize}
        showRanks={showRanks}
        isCut={isCut}
      />
      <StatCell
        stat={golfer?.stats?.sg_app}
        fieldSize={fieldSize}
        showRanks={showRanks}
        isCut={isCut}
      />
      <StatCell
        stat={golfer?.stats?.sg_ott}
        fieldSize={fieldSize}
        showRanks={showRanks}
        isCut={isCut}
      />
      <StatCell
        stat={golfer?.stats?.sg_total}
        fieldSize={fieldSize}
        showRanks={showRanks}
        isCut={isCut}
        borderRight={true}
      />

      {/* Users Group */}
      <td
        className={`px-3 py-0.5 whitespace-nowrap border-l border-gray-400 ${USERS_WIDTH}`}
      >
        <UserAvatarStack
          users={golfer?.users}
          isLoading={false}
          rowIndex={rowIndex}
          totalRows={totalRows}
        />
      </td>
    </tr>
  );
};

const calculateExpectedPoints = (predictions) => {
  if (!predictions) return 0;

  const { win, top_5, top_10, top_20, make_cut } = predictions;

  // Convert odds to probabilities (they come as odds)
  const winProb = win ? 1 / win : 0;
  const top5Prob = top_5 ? 1 / top_5 : 0;
  const top10Prob = top_10 ? 1 / top_10 : 0;
  const top20Prob = top_20 ? 1 / top_20 : 0;
  const makeCutProb = make_cut ? 1 / make_cut : 0;

  // Calculate position-specific probabilities
  const secondProb = (top5Prob - winProb) * 0.25; // 25% of remaining top 5 probability
  const thirdProb = (top5Prob - winProb) * 0.25; // 25% of remaining top 5 probability
  const fourthProb = (top5Prob - winProb) * 0.25; // 25% of remaining top 5 probability
  const fifthProb = (top5Prob - winProb) * 0.25; // 25% of remaining top 5 probability
  const top10NotTop5Prob = top10Prob - top5Prob;
  const top20NotTop10Prob = top20Prob - top10Prob;
  const makeCutNotTop20Prob = makeCutProb - top20Prob;

  // Calculate expected points
  const expectedPoints =
    winProb * 100 + // Win
    secondProb * 75 + // 2nd
    thirdProb * 60 + // 3rd
    fourthProb * 50 + // 4th
    fifthProb * 40 + // 5th
    top10NotTop5Prob * 30 + // Top 10 (not top 5)
    top20NotTop10Prob * 25 + // Top 20 (not top 10)
    makeCutNotTop20Prob * 5; // Made cut (not top 20)

  return expectedPoints;
};

const pivotDataByGolfer = (picks, currentBigFetchData) => {
  const golfersMap = {};

  picks.forEach((pick) => {
    if (!pick.pick) return;

    const { golfer_id, golfer_first_name, golfer_last_name, datagolf_id, points, golfer_country_code } = pick.pick;

    console.log("country", golfer_country_code)
    if (!golfersMap[golfer_id]) {
      // Check if golfer exists in bigFetchData
      const isInTournament = currentBigFetchData?.tournament_stats?.live_stats?.[datagolf_id];
      
      golfersMap[golfer_id] = {
        name: `${golfer_first_name} ${golfer_last_name}`,
        first_name: golfer_first_name,
        last_name: golfer_last_name,
        position: isInTournament ? "-" : "DNP",  // Set DNP if not in tournament
        round_score: null,
        total_score: null,
        thru: null,
        end_hole: null,
        win: null,
        top5: null,
        top10: null,
        top20: null,
        make_cut: null,
        sgTotal: null,
        sgOtt: null,
        sgApp: null,
        sgArg: null,
        sgPutt: null,
        R1: null,
        R2: null,
        R3: null,
        R4: null,
        users: [],
        datagolf_id,
        points,
        country: golfer_country_code,
      };
    }

    golfersMap[golfer_id].users.push({
      first_name: pick.member?.first_name,
      last_name: pick.member?.last_name,
      avatar_url: pick.member?.avatar_url,
    });

    // Only try to add tournament data if the golfer is in the tournament
    if (currentBigFetchData && currentBigFetchData.tournament_stats?.live_stats?.[datagolf_id]) {
      const predictions = currentBigFetchData.model_predictions?.data?.find(
        (p) => String(p.dg_id) === String(datagolf_id)
      );
      const liveStats = currentBigFetchData.tournament_stats?.live_stats?.[datagolf_id];

      if (predictions) {
        // Predictions logic remains the same
        const makeCutProb = predictions.make_cut ? 1 / predictions.make_cut : 0;
        const missCutProb = Math.max(0, 1 - makeCutProb);

        golfersMap[golfer_id].win = predictions.win
          ? (1 / predictions.win) * 100
          : null;
        golfersMap[golfer_id].top5 = predictions.top_5
          ? (1 / predictions.top_5) * 100
          : null;
        golfersMap[golfer_id].top10 = predictions.top_10
          ? (1 / predictions.top_10) * 100
          : null;
        golfersMap[golfer_id].top20 = predictions.top_20
          ? (1 / predictions.top_20) * 100
          : null;
        golfersMap[golfer_id].make_cut = makeCutProb * 100;
        golfersMap[golfer_id].miss_cut = missCutProb * 100;
        golfersMap[golfer_id].expectedPoints =
          calculateExpectedPoints(predictions);
        golfersMap[golfer_id].end_hole = predictions.end_hole;
        golfersMap[golfer_id].round_number = predictions.round;
        golfersMap[golfer_id].R1 = predictions.R1;
        golfersMap[golfer_id].R2 = predictions.R2;
        golfersMap[golfer_id].R3 = predictions.R3;
        golfersMap[golfer_id].R4 = predictions.R4;
        

        // Use predictions for round-specific data
        golfersMap[golfer_id].thru = predictions.thru;
        golfersMap[golfer_id].round_score = predictions.today;
        golfersMap[golfer_id].round_number = predictions.round;
        golfersMap[golfer_id].end_hole = predictions.end_hole;

      }

      if (liveStats) {
        // Use live stats only for cumulative data
        golfersMap[golfer_id].position = liveStats.info.position;
        golfersMap[golfer_id].total_score = liveStats.info.total;
        
        // Store complete value/rank pairs for each stat
        golfersMap[golfer_id].stats = {
          sg_total: liveStats.sg_total,
          sg_ott: liveStats.sg_ott,
          sg_app: liveStats.sg_app,
          sg_arg: liveStats.sg_arg,
          sg_putt: liveStats.sg_putt,
          sg_t2g: liveStats.sg_t2g,
          sg_bs: liveStats.sg_bs,
          distance: liveStats.distance,
          accuracy: liveStats.accuracy,
          gir: liveStats.gir,
          prox_fw: liveStats.prox_fw,
          prox_rgh: liveStats.prox_rgh,
          scrambling: liveStats.scrambling,
        };
      }
    }
  });

  // Sort with DNPs at the bottom
  return Object.values(golfersMap).sort((a, b) => {
    // Handle DNPs
    if (a.position === "DNP" && b.position !== "DNP") return 1;
    if (a.position !== "DNP" && b.position === "DNP") return -1;
    if (a.position === "DNP" && b.position === "DNP") return 0;

    // Handle WDs
    if (a.position === "WD" && b.position !== "WD" && b.position !== "DNP") return 1;
    if (a.position !== "WD" && b.position !== "DNP" && a.position !== "DNP" && b.position === "WD") return -1;
    if (a.position === "WD" && b.position === "WD") return 0;

    const hasCuts = Object.values(golfersMap).some(golfer => golfer.position === "CUT");

    if (hasCuts) {
      // After cut: CUT players go to bottom, others sort by total score
      if (a.position === "CUT" && b.position !== "CUT") return 1;
      if (b.position === "CUT" && a.position !== "CUT") return -1;
      if (a.position === "CUT" && b.position === "CUT") {
        return (a.total_score ?? 0) - (b.total_score ?? 0);
      }
      return (a.total_score ?? 0) - (b.total_score ?? 0);
    } else {
      // Before cut: Just sort by total score
      if (a.position === "WAITING" && b.position !== "WAITING") return 1;
      if (b.position === "WAITING" && a.position !== "WAITING") return -1;
      return (a.total_score ?? 0) - (b.total_score ?? 0);
    }
  });
};

const getRankColor = (rank) => {
  if (!rank) return "";

  // Color scale based on rank position
  if (rank <= 5) return "bg-green-500/20";
  if (rank <= 15) return "bg-green-500/10";
  if (rank >= 100) return "bg-red-500/20";
  if (rank >= 50) return "bg-red-500/10";
  return "";
};


const buildTitle = (
  event_name,
  course_name,
  isLive,
  showRanks,
  setShowRanks
) => {
  return (
    <div className="flex flex-row justify-between items-start w-full">
      <div className="flex flex-col flex-grow">
        <div className="text-white/90 font-bold whitespace-nowrap pr-4 text-xl mb-[-2px]">
          {formatTournamentName(event_name)}
        </div>
        <div className="text-white/60 italic text-sm mb-[-2px] text-left">
          {course_name}
        </div>
      </div>
      <div className="flex items-center h-6">
        <label className="inline-flex items-center cursor-pointer">
          <span
            className={`mr-2 text-xs ${
              !showRanks ? "text-[#BFFF00] font-medium" : "text-gray-400"
            }`}
          >
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showRanks}
              onChange={(e) => setShowRanks(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-8 h-4 bg-white/10 rounded-full peer 
              peer-focus:ring-2 peer-focus:ring-[#BFFF00]/25 
              peer-checked:bg-[#BFFF00]/25 
              after:content-[''] after:absolute after:top-[2px] 
              after:left-[2px] after:bg-gray-200 after:rounded-full 
              after:h-3 after:w-3 after:transition-all 
              peer-checked:after:translate-x-full 
              peer-checked:after:bg-[#BFFF00]"
            />
          </div>
          <span
            className={`ml-2 text-xs ${
              showRanks ? "text-[#BFFF00] font-medium" : "text-gray-400"
            }`}
          >
            Show Ranks
          </span>
        </label>
        {isLive && (
          <div className="live-indicator ml-4 pt-3 flex-shrink-0 self-center">
            <div className="live-text">LIVE</div>
            <div className="live-pulse mt-[-3px] "></div>
          </div>
        )}
      </div>
    </div>
  );
};

const formatTimeDifference = (lastUpdated) => {
  if (!lastUpdated) return null;

  try {
    const lastUpdateTime = new Date(lastUpdated);

    // Get current time in UTC
    const now = new Date();
    const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    const diffInMilliseconds = nowUTC - lastUpdateTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    return `${diffInMinutes} minutes ago`;
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Recently updated";
  }
};

const LivePicks = ({ setTitle }) => {
  const { selectedLeagueId } = useLeague();
  const [tableData, setTableData] = useState([]);
  const [bigFetchData, setBigFetchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [currentRound, setCurrentRound] = useState("#");
  const [isLive, setIsLive] = useState(false);
  const [fieldSize, setFieldSize] = useState(144);
  const [showRanks, setShowRanks] = useState(false);
  const [playersThruFirstHole, setPlayersThruFirstHole] = useState(0);

  useEffect(() => {
    if (bigFetchData?.tournament_stats) {
      const { course_name, event_name, field_size } =
        bigFetchData.tournament_stats;
      setTitle(
        buildTitle(event_name, course_name, isLive, showRanks, setShowRanks)
      );
      setFieldSize(field_size);
    } else {
      setTitle(
        <div className="flex flex-col justify-left animate-pulse">
          <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      );
    }
  }, [bigFetchData, setTitle, isLive, showRanks]);

  useEffect(() => {
    if (bigFetchData?.hole_scoring_distributions?.courses) {
      const firstCourse = bigFetchData.hole_scoring_distributions.courses[0];
      const firstRound = firstCourse?.rounds?.[0];
      const firstHole = firstRound?.holes?.[0];
      if (firstHole?.total?.players_thru) {
        setPlayersThruFirstHole(firstHole.total.players_thru);
      }
    }
  }, [bigFetchData]);

  useEffect(() => {
    // Check if any golfer is still playing (thru < 18)
    console.log(
      "Checking thru values:",
      tableData.map((g) => ({
        name: `${g.first_name} ${g.last_name}`,
        thru: g.thru,
        type: typeof g.thru,
      }))
    );

    const hasLiveScores = tableData.some(
      (golfer) =>
        golfer.thru !== null && golfer.thru !== undefined && golfer.thru < 18
    );

    console.log("Is tournament live?", hasLiveScores);
    setIsLive(hasLiveScores);
  }, [tableData]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setIsDataReady(false);

    const fetchData = async () => {
      if (!selectedLeagueId) {
        setIsLoading(false);
        return;
      }

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const [picksResponse, bigFetchResponse] = await Promise.all([
          fetch(`/api/league_picks/${selectedLeagueId}`, {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/live_results/big_fetch", {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [picksData, bigFetchData] = await Promise.all([
          picksResponse.json(),
          bigFetchResponse.json(),
        ]);

        setBigFetchData(bigFetchData);

        if (picksData.data?.picks) {
          const pivotedData = pivotDataByGolfer(
            picksData.data.picks,
            bigFetchData
          );
          setTableData(pivotedData);
          if (pivotedData.length > 0 && pivotedData[0].round_number) {
            setCurrentRound(pivotedData[0].round_number);
          }
        }

        setIsDataReady(true);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [selectedLeagueId]);

  const cutLines = getCutLines({
    currentRound,
    fieldSize,
    playersThruFirstHole,
    bigFetchData
  });


  return (
    <div className="live-picks">
      <div className="overflow-x-auto overscroll-x-none">
        <table className="w-full min-w-[900px] divide-y divide-white/10">
          <TableHeader round={currentRound} />
          <tbody className="divide-y divide-white/5">
            {isLoading || !isDataReady ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} isLoading={true} showRanks={showRanks} />
              ))
            ) : (
              tableData.map((golfer, i) => {
                if (
                  golfer.position === "CUT" && 
                  !tableData.slice(0, i).some(g => g.position === "CUT")
                ) {
                  const cutLine = cutLines[0];
                  return [
                    <CutLineRow 
                      key="cutline" 
                      score={cutLine.score}
                      probability={cutLine.probability}
                    />,
                    <TableRow
                      key={i}
                      golfer={golfer}
                      isLoading={false}
                      rowIndex={i}
                      totalRows={tableData.length}
                      currentRound={currentRound}
                      fieldSize={fieldSize}
                      showRanks={showRanks}
                    />
                  ];
                }

                return (
                  <TableRow
                    key={i}
                    golfer={golfer}
                    isLoading={false}
                    rowIndex={i}
                    totalRows={tableData.length}
                    currentRound={currentRound}
                    fieldSize={fieldSize}
                    showRanks={showRanks}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {bigFetchData?.last_updated && (
        <div className="text-center py-1 text-xs text-white/50 italic border-t border-white/10">
          Updated {formatTimeDifference(bigFetchData.last_updated)}
        </div>
      )}
    </div>
  );
};

export default LivePicks;
