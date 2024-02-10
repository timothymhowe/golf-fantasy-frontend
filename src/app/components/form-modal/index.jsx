import { Dialog, Transition } from "@headlessui/react";


const dialogContainerStyles = "fixed inset-0 z-10 justify-center flex h-full overflow-visible";
const backdropStyles = "absolute inset-0 bg-black opacity-50 blur-lg h-[120vh]";
const dialogStyles = "relative my-auto mt-20 mx-5 max-w-lg p-1 bg-white rounded shadow-lg w-full h-auto";

const FormModal = ({ isOpen, setIsOpen, children, onClose }) => {
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
          {children}
        </div>
      </Dialog>
    </Transition>
  );
};

export default FormModal;
