'use client';

import { useState, useEffect } from 'react';
import { useLeague } from '../../../../league-context';
import { useAuth } from '../../../../auth-provider';

export const ManualPickEntry = () => {
  const { selectedLeagueId, leagues } = useLeague();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    league_members: [],
    tournaments: [],
    golfers: []
  });

  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedGolfer, setSelectedGolfer] = useState('');
  const [golferSearchTerm, setGolferSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedLeagueId || !user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/commish/league-data/${selectedLeagueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch league data');
        }
      } catch (err) {
        console.error('Error fetching league data:', err);
        setError('Failed to load league data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLeagueId, user, leagues]);

  // Filter golfers based on search term
  const filteredGolfers = data.golfers.filter(golfer => 
    golfer.name.toLowerCase().includes(golferSearchTerm.toLowerCase())
  ).slice(0, 10); // Limit to first 10 matches

  const handleSubmit = async () => {
    try {
      console.log('Submitting pick:', {
        league_member_id: selectedMember,
        tournament_id: selectedTournament,
        golfer_id: selectedGolfer
      });

      const token = await user.getIdToken();
      const response = await fetch('/api/commish/manual-pick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          league_member_id: selectedMember,
          tournament_id: selectedTournament,
          golfer_id: selectedGolfer
        })
      });

      const result = await response.json();
      console.log('Submit response:', result);

      if (response.ok) {
        alert('Pick submitted successfully!');
        // Clear selections
        setSelectedMember('');
        setSelectedTournament('');
        setSelectedGolfer('');
        setGolferSearchTerm('');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error('Error submitting pick:', err);
      alert('Failed to submit pick. Check console for details.');
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <div>Please log in to access this feature.</div>
        <div className="text-sm text-gray-600 mt-2">
          Debug: User status - {user ? 'Logged in' : 'Not logged in'}
        </div>
      </div>
    );
  }

  if (!selectedLeagueId) {
    return (
      <div className="p-4">
        <div>Please select a league first.</div>
        <div className="text-sm text-gray-600 mt-2">
          Debug: League ID - {selectedLeagueId || 'None'}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div>Loading pick data...</div>
        <div className="text-sm text-gray-600 mt-2">
          Debug: Loading for league {selectedLeagueId}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600">Error: {error}</div>
        <div className="text-sm text-gray-600 mt-2">
          Debug Info:
          <pre className="bg-gray-100 p-2 mt-1 rounded">
            League: {JSON.stringify(data, null, 2)}
            Has League ID: {Boolean(selectedLeagueId).toString()}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Manual Pick Entry Form</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            League Member
          </label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="">Select Member</option>
            {data.league_members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tournament
          </label>
          <select 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          >
            <option value="">Select Tournament</option>
            {data.tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name} ({tournament.start_date})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Golfer
          </label>
          <div className="relative">
            <input
              type="text"
              list="golfer-options"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={golferSearchTerm}
              onChange={(e) => {
                setGolferSearchTerm(e.target.value);
                // Find the matching golfer and update selection
                const matchingGolfer = data.golfers.find(g => g.name === e.target.value);
                setSelectedGolfer(matchingGolfer ? matchingGolfer.id : '');
              }}
              placeholder="Search for a golfer..."
            />
            <datalist id="golfer-options">
              {filteredGolfers.map(golfer => (
                <option key={golfer.id} value={golfer.name} />
              ))}
            </datalist>
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedMember || !selectedTournament || !selectedGolfer}
          onClick={handleSubmit}
          className="w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Pick
        </button>
      </div>
    </div>
  );
};