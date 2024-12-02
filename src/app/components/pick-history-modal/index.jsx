import { Dialog, Transition } from "@headlessui/react";
import { useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';
import PickHistoryTable from './pick-history-table';

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
                <PickHistoryTable picks={pickHistory.picks} />
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
