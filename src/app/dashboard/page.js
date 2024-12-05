"use client"
import { useState, useEffect } from 'react';
import PageLayout from '../components/hg-layout';
import GuardedPage from '../components/guarded-page';
import LeagueInvitePrompt from '../components/widgets/league-invite';
import Pick from '../components/widgets/pick';
import Leaderboard from '../components/widgets/leaderboard';
import { useAuth } from '../components/auth-provider';
import LoadingScreen from '../components/loading-screen';
/**
 * Dashboard Home Page
 * Protected route that checks both authentication and league membership
 */
export default function Home() {
  const [hasLeague, setHasLeague] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Check if user belongs to a league
   */
  useEffect(() => {
    const checkLeagueMembership = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/league/membership', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check league membership');
        }

        const data = await response.json();
        setHasLeague(data.hasLeague);
      } catch (error) {
        console.error('Error checking league membership:', error);
        setHasLeague(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLeagueMembership();
  }, [user]);

  return (
    <GuardedPage>
      {isLoading ? (
        <LoadingScreen />
        // <div className="flex justify-center items-center h-full">
        //   Loading...
        // </div>
      ) : (
        <PageLayout>
          {hasLeague ? (
            null  // PageLayout will show default widgets when no children
          ) : (
            <div title={'League Invite'} className="flex justify-center items-center h-full">
              <LeagueInvitePrompt onSuccess={() => setHasLeague(true)} />
            </div>
          )}
          
        </PageLayout>
      )}
    </GuardedPage>
  );
}
