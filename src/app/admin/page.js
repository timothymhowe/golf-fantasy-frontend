'use client';

import PageLayout from '../components/hg-layout';
import { AdminGuard } from '../components/admin/admin-guard';
import { AdminDashboard } from '../components/admin/admin-dashboard';
import { useAuth } from '../components/auth-provider';
import { useLeague } from '../components/league-context';

const AdminContent = () => {
  const { userProfile } = useAuth();
  const { selectedLeagueId } = useLeague();

  const currentLeagueMembership = userProfile?.leagues?.find(
    league => league.league_id === selectedLeagueId
  );

  return (
    <AdminGuard roleId={currentLeagueMembership?.role_id}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <AdminDashboard roleId={currentLeagueMembership?.role_id} />
      </div>
    </AdminGuard>
  );
};

const AdminPage = () => {
  return (
    <PageLayout>
      <AdminContent />
    </PageLayout>
  );
};

export default AdminPage;
