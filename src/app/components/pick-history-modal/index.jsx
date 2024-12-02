import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from 'react';
import { useAuth } from '../auth-provider';
import PickHistoryTable from './pick-history-table';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
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
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close dialog"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>

              <div className="p-6 text-gray-800">
                <div className="mb-4">
                  <h2>Pick History</h2>
                  <h3 className="text-2xl font-bold">
                    {pickHistory ? pickHistory.member.name : memberName}
                  </h3>
                </div>
                
                <PickHistoryTable 
                  picks={pickHistory?.picks} 
                  isLoading={isLoading} 
                  containerHeight="h-[60vh]"
                />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PickHistoryModal;
