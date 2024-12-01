import { Dialog, Transition, Tab } from "@headlessui/react";
import { useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';
import PickHistoryGraph from './pick-history-graph';
import PickHistoryTable from './pick-history-table';

const dialogContainerStyles = "fixed inset-0 z-10 overflow-y-auto";
const backdropStyles = "fixed inset-0 bg-black opacity-50";
const dialogStyles = "relative mx-auto max-w-xl w-[95%] bg-white rounded shadow-lg";

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
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all">
            <div className="p-6 text-gray-800">
              {pickHistory && (
                <div className="mb-4">
                  <h2>Pick History</h2>
                  <h3 className="text-2xl font-bold">{pickHistory.member.name}</h3>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : pickHistory && (
                <>

                  <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-lg bg-blue-900/10 p-0.5  w-48 mx-auto ">
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-md py-1.5 text-xs font-medium leading-none
                          ${selected 
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-600'
                          }`
                        }
                      >
                        List
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-md py-1.5 text-xs font-medium leading-none
                          ${selected 
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-600'
                          }`
                        }
                      >
                        Graph
                      </Tab>
                    </Tab.List>

                    <Tab.Panels className="overflow-hidden">
                      <Tab.Panel className="overflow-y-auto">
                        <PickHistoryTable picks={pickHistory.picks} />
                      </Tab.Panel>

                      <Tab.Panel>
                        <div className="h-[50vh]">
                          <PickHistoryGraph picks={pickHistory.picks} />
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>

                  <div className="border-t items-center">
                    <div className="grid grid-cols-3 text-xs justify-items-center pt-1">
                      <div className="text-center">
                        <div className="text-gray-600">Wins</div>
                        <div>{pickHistory.summary.wins}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Missed/Dup</div>
                        <div>
                          {pickHistory.summary.missed_picks}/{pickHistory.summary.duplicate_picks}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Total Points</div>
                        <div className="font-mono">
                          {pickHistory.summary.total_points > 0 ? '+' : ''}
                          {pickHistory.summary.total_points}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
