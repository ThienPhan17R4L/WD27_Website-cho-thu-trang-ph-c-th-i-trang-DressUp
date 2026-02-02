import { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Drawer({ open, onClose, children }: DrawerProps) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>}
      <div className={"fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 " + (open ? "translate-x-0" : "translate-x-full")}>
        <div className="p-6 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}

export default Drawer;
