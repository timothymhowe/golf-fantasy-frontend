'use client';

import { useState } from 'react';
import { useAuth } from '../../../../auth-provider';

export const JobRunner = ({ title, description, jobType, params }) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRunning(true);
    setStatus('Starting job...');

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/jobs/${jobType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (response.ok) {
        setStatus(`Job started successfully. Job ID: ${result.job_id}`);
      } else {
        setStatus(`Error: ${result.message}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-neutral-100 rounded-lg shadow-md p-6 m-2">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {params.map(param => (
          <div key={param.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label}
            </label>
            {param.type === 'select' ? (
              <select
                name={param.name}
                required={param.required}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData[param.name] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  [param.name]: e.target.value
                })}
              >
                <option value="">Select {param.label}</option>
                {param.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={param.type}
                name={param.name}
                required={param.required}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData[param.name] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  [param.name]: e.target.value
                })}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isRunning}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running...' : 'Run Job'}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-md ${
            status.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
};
