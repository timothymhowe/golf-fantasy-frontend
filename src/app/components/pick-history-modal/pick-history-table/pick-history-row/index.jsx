import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getGolferPhotoUrl } from '../../../../utils/images';

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year.slice(-2)}`;
};

const PickHistoryRow = ({ pick, weekNumber }) => {
  const [photoUrl, setPhotoUrl] = useState("/portrait_placeholder_75.png");

  useEffect(() => {
    if (pick.golfer?.datagolf_id) {
      getGolferPhotoUrl(pick.golfer.datagolf_id).then(setPhotoUrl);
    }
  }, [pick.golfer?.datagolf_id]);

  return (
    <tr className={`
      border-b hover:bg-gray-50 h-8
      ${pick.is_future ? 'text-gray-500 italic' : ''}
      ${pick.pick_status?.is_no_pick ? 'text-red-500' : ''}
      ${pick.pick_status?.is_duplicate_pick ? 'text-orange-500' : ''}
      ${!pick.is_future && pick.result?.result === '1' ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
    `}>
      <td className="text-center py-0 text-xs text-gray-500">
        {weekNumber}
      </td>
      <td className="py-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative flex-shrink-0 flex items-center justify-center">
            {pick.pick_status?.is_no_pick ? (
              <span className="text-2xl">🤡</span>
            ) : (
              <Image 
                src={photoUrl}
                alt=""
                width={32}
                height={32}
                className="rounded object-cover bg-gray-100"
              />
            )}
          </div>
          <div className="min-w-0 leading-none">
            <div className="text-[11px] font-bold pb-0.5 flex items-center gap-1 leading-normal">
              <span className="truncate" title={pick.tournament.name}>
                {pick.tournament.name}
              </span>
              {pick.tournament.is_major && 
                <span className="flex-shrink-0 px-1 bg-gray-200 text-gray-700 rounded text-[9px] font-medium">
                  1.25x
                </span>
              }
            </div>
            <div className="text-[13px] font-normal truncate py-0.5">
              {pick.is_future ? (
                formatDate(pick.tournament.date)
              ) : pick.pick_status?.is_no_pick ? (
                <span className="italic">No Pick</span>
              ) : (
                pick.golfer?.name || 'Unknown Golfer'
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="text-right py-0 leading-none hidden sm:table-cell">
        {!pick.is_future && (
          pick.pick_status?.is_no_pick ? '-' :
          pick.result?.status === 'cut' ? 'CUT' :
          pick.result?.status === 'wd' ? 'WD' :
          pick.result?.result || '-'
        )}
      </td>
      <td className="text-right font-mono leading-none">
        <div className="flex items-center justify-end gap-1 pr-4">
          {!pick.is_future && (
            <span>{pick.points > 0 ? `+${pick.points}` : pick.points}</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PickHistoryRow;
