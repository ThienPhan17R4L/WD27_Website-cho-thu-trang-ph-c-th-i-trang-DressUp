import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  onToggleSidebar: () => void;
}

function Topbar({ onToggleSidebar }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between bg-white border-b px-4 py-2">
      <button onClick={onToggleSidebar} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="relative hidden md:block">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute top-2.5 left-3" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
        />
      </div>
      <div className="relative ml-4">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center focus:outline-none">
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
          <ChevronDownIcon className="h-5 w-5 text-gray-600 ml-1" />
        </button>
        {menuOpen && (
          <ul ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md">
            <li>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </button>
            </li>
            <li>
              <button 
                onClick={() => { 
                  setMenuOpen(false); 
                  navigate('/login'); 
                }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}

export default Topbar;
