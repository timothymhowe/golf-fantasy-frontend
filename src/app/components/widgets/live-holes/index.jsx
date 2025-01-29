import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export const LiveHoles = ({ setTitle }) => {
  const [selectedRound, setSelectedRound] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(0);
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [bigFetchResponse, setBigFetchResponse] = useState(null);
  const [bigFetchData, setBigFetchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWaves, setShowWaves] = useState(false);
  const [showEventAverage, setShowEventAverage] = useState(false);
  const [showBackNine, setShowBackNine] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
    
        const [bigFetchResponse] = await Promise.all([
          fetch("/api/live_results/big_fetch", {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [bigFetchData] = await Promise.all([
          bigFetchResponse.json(),
        ]);

        setBigFetchData(bigFetchData);
        setCourseData(bigFetchData.hole_scoring_distributions.courses[0]);

        setIsLoading(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [selectedLeagueId]);

  useEffect(() => {
    if (bigFetchData?.hole_scoring_distributions?.courses) {
      const coursesData = bigFetchData.hole_scoring_distributions.courses;
      setCourses(coursesData);
      const newCourseData = coursesData[selectedCourse];
      setCourseData(newCourseData);

      // Check if current selected round exists in new course
      if (newCourseData && (!newCourseData.rounds || selectedRound >= newCourseData.rounds.length)) {
        // If not, set to the last available round
        const lastAvailableRound = newCourseData.rounds ? newCourseData.rounds.length - 1 : 0;
        setSelectedRound(Math.max(0, lastAvailableRound));
      }
    }
    setTitle('Hole-by-Hole');

  }, [bigFetchData, selectedCourse]);

  // Add window resize listener
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth < 768); // adjust this breakpoint as needed
    };

    checkWidth(); // Check initial width
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const calculateEventAverage = (holeIndex) => {
    let totalScore = 0;
    let totalPlayers = 0;
    
    courses.forEach(course => {
      course.rounds.forEach(round => {
        const hole = round.holes[holeIndex];
        if (hole?.total) {
          totalScore += hole.total.avg_score * hole.total.players_thru;
          totalPlayers += hole.total.players_thru;
        }
      });
    });

    return totalPlayers > 0 ? totalScore / totalPlayers : null;
  };

  if (isLoading) {
    return <div className="p-4 text-center text-white/50">Loading hole data...</div>;
  }

  if (!courseData) {
    return <div className="p-4 text-center text-white/50">No hole data available</div>;
  }

  const rounds = courseData.rounds;

  const totalHoles =  rounds[selectedRound].holes.length;

  

  // Find max score relative to par for scaling
  const maxScoreRelativeToPar = Math.max(
    ...rounds[selectedRound].holes.map(hole => {
      return (Math.max( Math.abs(hole.morning_wave.avg_score - hole.par),
      Math.abs(hole.afternoon_wave.avg_score - hole.par), Math.abs(hole.total.avg_score - hole.par))) + 0.1
    })
  );

  // Add event average option to rounds dropdown
  const roundOptions = courseData?.rounds ? [
    ...courseData.rounds.map((_, index) => ({
      label: `Round ${index + 1}`,
      value: index
    })),
    {
      label: 'Event Average',
      value: 'event'
    }
  ] : [];

  const holes = courseData?.rounds[selectedRound]?.holes;
  const displayHoles = holes ? (
    isNarrow 
      ? (showBackNine ? holes.slice(9, 18) : holes.slice(0, 9)) 
      : holes
  ) : [];

  const renderBar = (data, isAM, hole) => {
    const scoreRelativeToPar = data.avg_score - hole.par;
    const heightPercent = (Math.abs(scoreRelativeToPar) / maxScoreRelativeToPar) * 50;
    const isOverPar = scoreRelativeToPar > 0;

    // Choose color based on over/under par and AM/PM
    let color;
    if (isOverPar) {
      color = isAM ? 'bg-red-500/80' : 'bg-red-600/80';  // Lighter red for AM, darker for PM
    } else {
      color = isAM ? 'bg-[#BFFF00]/80' : 'bg-[#96CC00]/80';  // Lighter green for AM, darker for PM
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className={`w-full ${color}`}
          style={{
            height: `${heightPercent}%`,
            minHeight: '1px',
            transform: `translateY(${isOverPar ? '-50%' : '50%'})`,
            transformOrigin: isOverPar ? 'bottom' : 'top'
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Controls at top */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          {/* Round selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white/50">Round:</span>
            <div className="relative">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="appearance-none pl-2 pr-6 py-0.5 text-xs bg-neutral-800 border border-white/10 text-white/90 rounded-sm hover:border-white/20 focus:outline-none focus:border-white/30"
              >
                {courseData?.rounds?.map((_, index, array) => (
                  <option key={index} value={index}>{array.length - index}</option>
                )).reverse()}
              </select>
            </div>
          </div>

          {/* Course selector */}
          {courses.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-white/50">Course:</span>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  className="appearance-none pl-2 pr-6 py-0.5 text-xs bg-neutral-800 border border-white/10 text-white/90 rounded-sm hover:border-white/20 focus:outline-none focus:border-white/30"
                >
                  {courses.map((course, index) => (
                    <option key={index} value={index}>{course.course_code}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Wave toggle */}
        <label className="inline-flex items-center cursor-pointer">
          <span
            className={`mr-2 text-xs ${
              !showWaves ? "text-[#BFFF00] font-medium" : "text-gray-400"
            }`}
          >
            Total
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showWaves}
              onChange={(e) => setShowWaves(e.target.checked)}
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
              showWaves ? "text-[#BFFF00] font-medium" : "text-gray-400"
            }`}
          >
            AM/PM
          </span>
        </label>
      </div>

      {/* Hole Info Table - increase min-height to prevent jiggle */}
      <div className="overflow-x-auto min-h-[144px]">
        <table className="w-full text-xs text-white/50">
          <thead>
            <tr className="text-left">
              <th className="py-1 pr-2 w-16">Hole</th>
              {displayHoles.map((hole) => (
                <th key={hole.hole} className="px-1 text-center">{hole.hole}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10">
              <th className="py-1 pr-2 text-left">Par</th>
              {displayHoles.map((hole) => (
                <td key={hole.hole} className="px-1 text-center">{hole.par}</td>
              ))}
            </tr>
            <tr className="border-t border-white/10">
              <th className="py-1 pr-2 text-left">Yards</th>
              {displayHoles.map((hole) => (
                <td key={hole.hole} className="px-1 text-center">{hole.yardage}</td>
              ))}
            </tr>
            {showWaves ? (
              <>
                <tr className="border-t border-white/10">
                  <th className="py-1 text-left">AM +/-</th>
                  {displayHoles.map((hole) => (
                    <td key={hole.hole} className="px-1 text-center">
                      {(hole.morning_wave.avg_score - hole.par > 0 ? '+' : '')}{(hole.morning_wave.avg_score - hole.par).toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-white/10">
                  <th className="py-1 text-left">PM +/-</th>
                  {displayHoles.map((hole) => (
                    <td key={hole.hole} className="px-1 text-center">
                      {(hole.afternoon_wave.avg_score - hole.par > 0 ? '+' : '')}{(hole.afternoon_wave.avg_score - hole.par).toFixed(2)}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <tr className="border-t border-white/10">
                <th className="py-1 text-left">Tot. +/-</th>
                {displayHoles.map((hole) => (
                  <td key={hole.hole} className="px-1 text-center">
                    {(hole.total.avg_score - hole.par > 0 ? '+' : '')}{(hole.total.avg_score - hole.par).toFixed(2)}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bar graph */}
      <div className="relative h-64 flex items-center gap-0.5 bg-black/10 ml-16">
        {/* Zero line (par) */}
        <div className="absolute w-full h-[1px] bg-white/30 top-1/2" />
        
        {displayHoles.map((hole, index) => {
          if (selectedRound === 'event') {
            const eventAvg = calculateEventAverage(index);
            const scoreRelativeToPar = eventAvg ? eventAvg - hole.par : 0;
            const heightPercent = (Math.abs(scoreRelativeToPar) / maxScoreRelativeToPar) * 50;
            const isOverPar = scoreRelativeToPar > 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center h-full relative">
                {/* Score value */}
                <div className="text-[10px] absolute top-0 text-white/50">
                  {eventAvg ? eventAvg.toFixed(3) : '-'}
                </div>

                {/* Bar container */}
                <div className="absolute inset-0 flex items-center justify-center px-1 w-16">
                  <div className="w-2">
                    <div 
                      className={`w-full ${isOverPar ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: '1px',
                        transform: `translateY(${isOverPar ? '-50%' : '50%'})`,
                        transformOrigin: isOverPar ? 'bottom' : 'top'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={index}
              className="flex-1 flex flex-col items-center h-full relative"
            >
              {/* Remove mx-1 from parent and add padding to the bar container */}
              
              {/* Vertical dividing line */}
              <div className="absolute h-full w-[1px] bg-white/10 right-0" />
              
              {/* Score value */}

              {/* Bar container - centered vertically and horizontally */}
              <div className="absolute inset-0 flex items-center justify-center px-2">
                {showWaves ? (
                  <div className="w-[36px] h-full flex gap-0.5">
                    <div className="flex-1 h-full flex items-center justify-center">
                      {renderBar(hole.morning_wave, true, hole)}
                    </div>
                    <div className="flex-1 h-full flex items-center justify-center">
                      {renderBar(hole.afternoon_wave, false, hole)}
                    </div>
                  </div>
                ) : (
                  <div className="w-[36px] h-full flex items-center justify-center"> {/* Reduced width to ensure centering */}
                    {renderBar(hole.total, hole.total.avg_score > hole.par ? 'bg-red-500/80' : 'bg-[#BFFF00]/80', hole)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Y-axis labels */}
        <div className="absolute -left-6 h-full flex flex-col justify-between text-[10px] text-white/30">
          <span>+{maxScoreRelativeToPar.toFixed(1)}</span>
          <span>Par</span>
          <span>-{maxScoreRelativeToPar.toFixed(1)}</span>
        </div>
      </div>


      {/* Nine hole selector - updated styling */}
      {isNarrow && (
        <div className="flex justify-center gap-2 mt-4 pb-2">
          <button
            onClick={() => setShowBackNine(false)}
            className={`px-3 py-0.5 text-xs rounded-sm border ${
              !showBackNine 
                ? 'bg-[#BFFF00]/20 text-[#BFFF00] border-[#BFFF00]/30 hover:border-[#BFFF00]/50' 
                : 'bg-neutral-800 text-white/70 border-white/10 hover:border-white/20'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => setShowBackNine(true)}
            className={`px-3 py-0.5 text-xs rounded-sm border ${
              showBackNine 
                ? 'bg-[#BFFF00]/20 text-[#BFFF00] border-[#BFFF00]/30 hover:border-[#BFFF00]/50' 
                : 'bg-neutral-800 text-white/70 border-white/10 hover:border-white/20'
            }`}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};
export default LiveHoles;


