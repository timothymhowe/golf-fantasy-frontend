import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';
import PickHistoryTable from './pick-history-table';
import PickHistoryGraph from './pick-history-graph';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal component that displays a member's pick history
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls visibility of the modal
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {string} props.memberId - ID of the league member whose picks are being displayed
 * @param {string} props.memberName - Name of the league member whose picks are being displayed
 * @returns {JSX.Element} Pick history modal component
 */
const PickHistoryModal = ({ isOpen, onClose, memberId, memberName }) => {
  const { user } = useAuth();
  const [pickHistory, setPickHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Only call onClose, data clearing happens after transition
  const handleClose = () => {
    onClose();
  };

  // Clear data after transition
  const handleAfterLeave = () => {
    setPickHistory(null);
    setShowGraph(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setPickHistory(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !memberId) return;

    const fetchPickHistory = async () => {
      setIsLoading(true);
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

    fetchPickHistory();
  }, [memberId, isOpen, user]);

  return (
    <Transition show={isOpen} as={Fragment} afterLeave={handleAfterLeave}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={handleClose}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl transform rounded-xl bg-white shadow-2xl transition-all relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close dialog"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>

              <div className="p-6 text-gray-800">
                <div className="mb-4">
                  <h2>Pick History</h2>
                  <h3 className="text-2xl font-bold mb-2">{memberName}</h3>
                  
                  <div className="flex items-center h-6">
                    {!isLoading && pickHistory && (
                      <label className="inline-flex items-center cursor-pointer">
                        <span className={`mr-2 text-xs ${!showGraph ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          Table
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={showGraph}
                            onChange={(e) => setShowGraph(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full" />
                        </div>
                        <span className={`ml-2 text-xs ${showGraph ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          Graph
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="h-[50vh]">
                  {isLoading ? (
                    <div className="h-full flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                  ) : pickHistory && (
                    <>
                      {!showGraph ? (
                        <PickHistoryTable picks={pickHistory.picks} />
                      ) : (
                        <PickHistoryGraph picks={pickHistory.picks} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
