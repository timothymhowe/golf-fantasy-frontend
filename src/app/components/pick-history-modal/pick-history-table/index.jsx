import PickHistoryRow from './pick-history-row';

const PickHistoryTable = ({ picks, isLoading, maxHeight = '300px' }) => {
  if (isLoading) {
    return (
      <div style={{ maxHeight }} className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BFFF00]" />
      </div>
    );
  }

  // Sort picks by tournament date, oldest first
  const sortedPicks = [...picks].sort((a, b) => 
    new Date(a.tournament.date) - new Date(b.tournament.date)
  );

  return (
    <div style={{ maxHeight }} className="overflow-y-auto">
      <table className="w-full   text-sm relative">
        <thead className="sticky top-0 bg-black sm:bg-black/40 sm:backdrop-blur-sm z-10">
          <tr className="h-7 uppercase text-white/50">
            <th className="text-center py-0 w-8 text-xs "></th>
            <th className="text-left py-0 w-[60%] text-xs ">Pick</th>
            <th className="text-right w-[15%] text-xs hidden sm:table-cell">Result</th>
            <th className="text-right w-[20%] text-xs pr-4">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 font-[Verdana]">
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