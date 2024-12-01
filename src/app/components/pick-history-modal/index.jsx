import { Dialog, Transition, Tab } from "@headlessui/react";
import { useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';

const dialogContainerStyles = "fixed inset-0 z-10 justify-center flex h-full overflow-visible";
const backdropStyles = "absolute inset-0 bg-black opacity-50 blur-lg h-[120vh]";
const dialogStyles = "relative my-auto mt-20 mx-5 max-w-2xl p-1 bg-white rounded shadow-lg w-full h-auto";

const PickHistoryModal = ({ isOpen, onClose, memberId, memberName }) => {
  const { user } = useAuth();
  const [pickHistory, setPickHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !memberId) return;

    const fetchPickHistory = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/league/member/${memberId}/pick-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPickHistory(data);
      } catch (error) {
        console.error('Error fetching picks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchPickHistory();
  }, [memberId, isOpen, user]);

  return (
    <Transition
      show={isOpen}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog as="div" onClose={onClose} className={dialogContainerStyles}>
        <Dialog.Overlay className={backdropStyles} />

        <div className={dialogStyles}>
          <div className="p-6 text-gray-800">
            {pickHistory && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{pickHistory.member.name}</h2>
                <p className="text-gray-600">{pickHistory.member.league}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : pickHistory && (
              <>
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                        }`
                      }
                    >
                      List View
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                        ${selected 
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                        }`
                      }
                    >
                      Performance Graph
                    </Tab>
                  </Tab.List>

                  <Tab.Panels>
                    <Tab.Panel>
                      <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-sm text-gray-900 font-[Verdana]">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                              <th className="text-left py-1 w-[45%]">Tournament</th>
                              <th className="text-left w-[25%]">Golfer</th>
                              <th className="text-right w-[15%]">Result</th>
                              <th className="text-right w-[15%]">Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pickHistory.picks.map((pick, index) => (
                              <tr 
                                key={index}
                                className={`
                                  border-b hover:bg-gray-50 text-sm
                                  ${pick.pick_status.is_no_pick ? 'text-red-500' : ''}
                                  ${pick.pick_status.is_duplicate_pick ? 'text-orange-500' : ''}
                                  ${pick.result.result === '1' ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                                `}
                              >
                                <td className="py-1">
                                  <div className="truncate leading-tight" title={pick.tournament.name}>{pick.tournament.name}</div>
                                  <div className="text-xs text-gray-500 leading-none">
                                    {new Date(pick.tournament.date).toLocaleDateString()}
                                    {pick.tournament.is_major && 
                                      <span className="ml-2 text-yellow-600">★ Major</span>
                                    }
                                  </div>
                                </td>
                                <td className="py-1 leading-tight">
                                  {pick.golfer.name}
                                </td>
                                <td className="text-right py-1 leading-tight">
                                  {pick.result.status === 'cut' ? 'CUT' :
                                   pick.result.status === 'wd' ? 'WD' :
                                   pick.result.result}
                                </td>
                                <td className="text-right py-1 font-mono leading-tight">
                                  {pick.points > 0 ? `+${pick.points}` : pick.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div className="h-[60vh] flex items-center justify-center text-gray-500">
                        Graph view coming soon...
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-gray-600">Total Points</div>
                      <div className="font-mono text-base">
                        {pickHistory.summary.total_points > 0 ? '+' : ''}
                        {pickHistory.summary.total_points}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Picks</div>
                      <div className="text-base">{pickHistory.summary.total_picks}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Wins</div>
                      <div className="text-base">{pickHistory.summary.wins}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Missed/Duplicate</div>
                      <div className="text-base">
                        {pickHistory.summary.missed_picks}/{pickHistory.summary.duplicate_picks}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
