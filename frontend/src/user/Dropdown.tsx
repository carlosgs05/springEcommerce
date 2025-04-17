import React, { useEffect, useRef } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700"
    >
      {children}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
    >
      {icon}
      {children}
    </button>
  );
};