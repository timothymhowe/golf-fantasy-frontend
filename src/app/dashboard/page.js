"use client"
import { useState, useEffect } from 'react';
import PageLayout from '../components/hg-layout';
import GuardedPage from '../components/guarded-page';
import LeagueInvitePrompt from '../components/widgets/league-invite';
import { useAuth } from '../components/auth-provider';

/**
 * Dashboard Home Page
 * Protected route that checks both authentication and league membership
 */
export default function Home() {
  // State for league membership status
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
        // TODO: Replace with actual database query
        // Example: const userLeagues = await db.collection('leagues').where('members', 'array-contains', user.uid).get();
        setHasLeague(false); // Temporarily set to false to show invite prompt
      } catch (error) {
        console.error('Error checking league membership:', error);
        setHasLeague(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLeagueMembership();
  }, [user]);

  /**
   * Handle league invite code submission
   * @param {string} code - Invite code entered by user
   */
  const handleInviteCode = async (code) => {
    try {
      // TODO: Implement invite code validation and league joining
      // 1. Verify code exists and is valid
      // 2. Add user to league
      // 3. Update hasLeague state
      console.log('Processing invite code:', code);
    } catch (error) {
      console.error('Error processing invite code:', error);
      throw new Error('Invalid invite code');
    }
  };

  return (
    <GuardedPage>
      <PageLayout>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            Loading...
          </div>
        ) : !hasLeague ? (
          <div className="flex justify-center items-center h-full">
            <LeagueInvitePrompt onSubmitCode={handleInviteCode} />
          </div>
        ) : (
          // Regular dashboard content goes here
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {/* Add your dashboard widgets here */}
          </div>
        )}
      </PageLayout>
    </GuardedPage>
  );
}
