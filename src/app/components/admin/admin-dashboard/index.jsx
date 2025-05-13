'use client';

import { useState } from 'react';
import { AdminCommishToggle } from '../admin-commish-toggle';
import { AdminView } from './admin-view';
import { CommissionerView } from './commissioner-view';

export const AdminDashboard = ({ roleId }) => {
  const [currentView, setCurrentView] = useState('commissioner');

  return (
    <div className="space-y-4">
      <AdminCommishToggle 
        roleId={roleId}
        onViewChange={setCurrentView}
      />
      
      {currentView === 'commissioner' ? (
        <CommissionerView />
      ) : (
        <AdminView />
      )}
    </div>
  );
};