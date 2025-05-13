'use client';

import { useState } from 'react';

const ROLE_COMMISSIONER = 1;
const ROLE_ADMIN = 2;

export const AdminCommishToggle = ({ roleId, onViewChange }) => {
  const [currentView, setCurrentView] = useState('commissioner');

  const isAdmin = roleId === ROLE_ADMIN;

  // Only show toggle if user is an admin (not just commissioner)
  if (!isAdmin) {
    return null;
  }

  const handleViewChange = (view) => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  return (
    <div className="flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
          ${currentView === 'commissioner' 
            ? 'bg-blue-500 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => handleViewChange('commissioner')}
      >
        Commissioner View
      </button>
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium rounded-r-lg border 
          ${currentView === 'admin' 
            ? 'bg-green-500 text-white border-green-600' 
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        onClick={() => handleViewChange('admin')}
      >
        Admin View
      </button>
    </div>
  );
};
