import PickHistoryRow from './pick-history-row';

const PickHistoryTable = ({ picks }) => {
  // Sort picks by tournament date, oldest first
  const sortedPicks = [...picks].sort((a, b) => 
    new Date(a.tournament.date) - new Date(b.tournament.date)
  );

  return (
    <div className="max-h-[50vh] overflow-y-auto">
      <table className="w-full text-gray-900 font-[Verdana] text-sm relative">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b h-7">
            <th className="text-center py-0 w-8 text-xs"></th>
            <th className="text-left py-0 w-[60%] text-xs">Pick</th>
            <th className="text-right w-[15%] text-xs">Result</th>
            <th className="text-right w-[20%] text-xs pr-4">Points</th>
          </tr>
        </thead>
        <tbody>
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