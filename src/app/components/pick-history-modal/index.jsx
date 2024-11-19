import { Dialog, Transition } from "@headlessui/react";
import { useState, useEffect } from 'react';

const dialogContainerStyles = "fixed inset-0 z-10 justify-center flex h-full overflow-visible";
const backdropStyles = "absolute inset-0 bg-black opacity-50 blur-lg h-[120vh]";
const dialogStyles = "relative my-auto mt-20 mx-5 max-w-lg p-1 bg-white rounded shadow-lg w-full h-auto";

const PickHistoryModal = ({ isOpen, onClose, memberId, memberName }) => {
  const [picks, setPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPickHistory = async () => {
      try {
        const response = await fetch(`/api/members/${memberId}/picks`);
        const data = await response.json();
        setPicks(data);
      } catch (error) {
        console.error('Error fetching picks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPickHistory();
  }, [memberId, isOpen]);

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
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{memberName}'s Pick History</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-2">Tournament</th>
                      <th className="text-left">Golfer</th>
                      <th className="text-right">Position</th>
                      <th className="text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {picks.map((pick, index) => (
                      <tr 
                        key={index}
                        className={`
                          border-b hover:bg-gray-50
                          ${pick.status === 'cut' ? 'text-red-500' : ''}
                          ${pick.status === 'wd' ? 'text-orange-500' : ''}
                        `}
                      >
                        <td className="py-2">{pick.tournamentName}</td>
                        <td>{pick.golferName}</td>
                        <td className="text-right">{pick.position}</td>
                        <td className="text-right font-mono">
                          {pick.points >= 0 ? '+' : ''}{pick.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
