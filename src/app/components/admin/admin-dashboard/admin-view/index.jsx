import { JobRunner } from './job-runner';
export const AdminView = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-green-600 mb-4">Admin Controls</h2>

        <JobRunner title="Update Tournament Field" description="Update entrants in the field for the upcoming tournament." jobType="update_field" params={[]} />
        <JobRunner title="Calculate Week Scores" description="Calculate scores for all tournaments in a schedule" jobType="calculate_week_scores" params={[]} />

        <JobRunner title="Calculate User Points" description="Calculate scores for the users for the wee" jobType="calculate_week_scores" params={[]} />
      </div>
    );
  };