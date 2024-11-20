import { useState } from 'react';
import { useAuth } from '../../auth-provider';
import { useRouter } from 'next/navigation';

/**
 * League Invite Component
 * Displays a form for users to enter a league invite code
 * 
 * @param {Function} onSuccess - Callback function to handle successful league join
 */
const LeagueInvitePrompt = ({ onSuccess }) => {
  // State management for form
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  /**
   * Handle form submission
   * Validates and submits the invite code
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/commish/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join league');
      }

      onSuccess?.(); // Notify parent of success
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Join a League</h2>
      <p className="text-gray-600 mb-6">
        Enter an invite code to join a league. Don't have one? Ask your league commissioner for an invite code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invite Code Input */}
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
            Invite Code
          </label>
          <input
            type="text"
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your invite code"
          />
        </div>

        {/* Error Message Display */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !inviteCode.trim()}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading || !inviteCode.trim() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Checking...' : 'Join League'}
        </button>
      </form>
    </div>
  );
};

export default LeagueInvitePrompt;