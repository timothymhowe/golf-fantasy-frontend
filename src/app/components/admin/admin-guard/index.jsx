'use client';

import { useAuth } from '../../auth-provider';
import { useLeague } from '../../league-context';

// Role constants
const ROLE_COMMISSIONER = 1;
const ROLE_ADMIN = 2;

export const AdminGuard = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const { selectedLeagueId } = useLeague();

  if (loading || !userProfile) {
    return (
      <div className="bg-gray-100 border-l-4 border-gray-500 p-4 mb-4">
        <p className="text-gray-700">Loading access status...</p>
      </div>
    );
  }

  // Check for admin/commissioner roles in any league
  const hasAnyAdminRole = userProfile.leagues?.some(
    league => league.role_id === ROLE_ADMIN || league.role_id === ROLE_COMMISSIONER
  );

  // If no league is selected, show the "select a league" message
  if (!selectedLeagueId) {
    return (
      <div>
        <div className="border-l-4 p-4 mb-4 bg-yellow-100 border-yellow-500">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {hasAnyAdminRole 
                  ? "Please select a league from the dropdown to manage."
                  : "You don't have administrative access to any leagues."}
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Get user's role in the selected league
  const currentLeagueMembership = userProfile.leagues?.find(
    league => league.league_id === selectedLeagueId
  );

  const isCommissioner = currentLeagueMembership?.role_id === ROLE_COMMISSIONER;
  const isAdmin = currentLeagueMembership?.role_id === ROLE_ADMIN;
  const hasAccess = isCommissioner || isAdmin;

  // Return appropriate status message based on role
  const getStatusMessage = () => {
    if (isAdmin) return "You have full admin access to this league";
    if (isCommissioner) return "You have commissioner access to this league";
    return "You don't have administrative access to this league";
  };

  // Get appropriate color scheme based on role
  const getColorScheme = () => {
    if (isAdmin) return {
      bg: 'bg-green-100',
      border: 'border-green-500',
      text: 'text-green-700'
    };
    if (isCommissioner) return {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-700'
    };
    return {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-700'
    };
  };

  const colors = getColorScheme();

  return (
    <div>
      <div className={`border-l-4 p-4 mb-4 ${colors.bg} ${colors.border}`}>
        <div className="flex">
          <div className="ml-3">
            <p className={`text-sm ${colors.text}`}>
              {getStatusMessage()}
            </p>
          </div>
        </div>
      </div>
      {hasAccess && children}
    </div>
  );
};
