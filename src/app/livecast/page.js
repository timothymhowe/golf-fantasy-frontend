"use client"
import { useState, useEffect } from 'react';
import PageLayout from '../components/hg-layout';
import GuardedPage from '../components/guarded-page';
import { useAuth } from '../components/auth-provider';
import LoadingScreen from '../components/loading-screen';
import WidgetContainer from '../components/widget-container';
import LivePicks from '../components/widgets/live-picks';
import LiveHoles from '../components/widgets/live-holes';
import LeagueInvitePrompt from '../components/widgets/league-invite';
/**
 * Dashboard Home Page
 * Protected route that checks both authentication and league membership
 */
export default function Home() {
  const [hasLeague, setHasLeague] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const [liveCastTitle, setLiveCastTitle] = useState(null);
  const [courseStatsTitle, setCourseStatsTitle] = useState(null);

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
   
      ) : (
        <PageLayout>
          {hasLeague ? (
            <div className="grid grid-cols-1 gap-2 sm:px-10">
           <WidgetContainer title={liveCastTitle}>
            <LivePicks setTitle={setLiveCastTitle}/>
            </WidgetContainer>

            <WidgetContainer title={courseStatsTitle}>
                <LiveHoles setTitle={setCourseStatsTitle} />
            </WidgetContainer>
            </div>

          ) : (
            <div title={'League Invite'} className="flex justify-center items-center h-full">
              <LeagueInvitePrompt onSuccess={() => setHasLeague(true)} />
            </div>
          )
          }
        </PageLayout>
      )}
    </GuardedPage>
  );
}
