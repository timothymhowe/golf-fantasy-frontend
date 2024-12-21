import PickHistoryRow from './pick-history-row';

const PickHistoryTable = ({ picks, isLoading }) => {
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center max-h-[300px]`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BFFF00]" />
      </div>
    );
  }

  // Sort picks by tournament date, oldest first
  const sortedPicks = [...picks].sort((a, b) => 
    new Date(a.tournament.date) - new Date(b.tournament.date)
  );

  return (
    <div className="max-h-[300px] overflow-y-auto">
      <table className="w-full text-gray-200 font-[Verdana] text-sm relative">
        <thead className="sticky top-0 bg-black/60 backdrop-blur-sm z-10 uppercase">
          <tr className="border-b border-white/10 h-7 text-white/50">
            <th className="text-center py-0 w-8 text-xs"></th>
            <th className="text-left py-0 w-[60%] text-xs text-gray-400">Pick</th>
            <th className="text-right w-[15%] text-xs text-gray-400 hidden sm:table-cell">Result</th>
            <th className="text-right w-[20%] text-xs text-gray-400 pr-4">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {sortedPicks.map((pick, index) => (
            <PickHistoryRow 
              key={index} 
              pick={pick} 
              weekNumber={index + 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PickHistoryTable;