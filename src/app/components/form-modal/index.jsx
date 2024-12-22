import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from 'react';

const FormModal = ({ isOpen, setIsOpen, children, onClose }) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[150] overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-start justify-center px-2" style={{ marginTop: '2vh' }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 z-[140]" aria-hidden="true" />
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
            <Dialog.Panel className="inline-block w-full max-w-xl transform rounded-xl bg-[#1a1a1a] shadow-2xl transition-all z-[150]">
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FormModal;
