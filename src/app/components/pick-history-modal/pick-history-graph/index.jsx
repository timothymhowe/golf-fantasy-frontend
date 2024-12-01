import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getGolferPhotoUrl } from '../../../utils/images';
import { useState, useEffect, useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PickHistoryGraph = ({ picks }) => {
  const chronologicalPicks = [...picks].reverse();
  const cumulativePoints = chronologicalPicks.reduce((acc, pick, index) => {
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    acc.push(previousTotal + pick.points);
    return acc;
  }, []);

  const photoCache = useRef(new Map());

  useEffect(() => {
    picks.forEach(pick => {
      if (pick.golfer?.datagolf_id && !photoCache.current.has(pick.golfer.datagolf_id)) {
        getGolferPhotoUrl(pick.golfer.datagolf_id).then(url => {
          photoCache.current.set(pick.golfer.datagolf_id, url);
        });
      }
    });
  }, [picks]);

  const data = {
    labels: ['0', ...chronologicalPicks.map((_, index) => (index + 1).toString())],
    datasets: [
      {
        label: 'Total Points',
        data: [0, ...cumulativePoints],
        pointBackgroundColor: ['rgb(59, 130, 246)', ...chronologicalPicks.map(pick => {
          if (pick.result.result === '1') return 'rgb(234, 179, 8)';
          if (pick.tournament.is_major) return 'rgb(239, 68, 68)';
          return 'rgb(59, 130, 246)';
        })],
        pointHoverRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major || pick.result.result === '1' ? 7 : 5
        )],
        pointRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major || pick.result.result === '1' ? 5 : 3
        )],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.1,
        fill: true,
        borderWidth: 1.5,
        pointBorderColor: 'white',
        pointBorderWidth: 1,
        pointStyle: 'circle',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    font: {
      family: 'Verdana, sans-serif'
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Cumulative Points Over Time',
        font: {
          family: 'Verdana, sans-serif',
          size: 14,
          weight: '400'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        titleFont: {
          family: 'Verdana, sans-serif',
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Verdana, sans-serif',
          size: 12
        },
        padding: 8,
        boxPadding: 4,
        borderColor: '#ddd',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const pointIndex = context[0].dataIndex;
            if (pointIndex === 0) return null;
            return chronologicalPicks[pointIndex - 1].tournament.name;
          },
          label: (context) => {
            const pointIndex = context.dataIndex;
            if (pointIndex === 0) return null;
            const pick = chronologicalPicks[pointIndex - 1];
            const points = pick.points;
            const total = cumulativePoints[pointIndex - 1];
            
            return [
              `${pick.golfer.name}`,
              `Points: ${points > 0 ? '+' : ''}${points}`,
              `Total: ${total > 0 ? '+' : ''}${total}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawTicks: true,
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.3)',
        },
        title: {
          display: true,
          text: 'Week',
          font: {
            family: 'Verdana, sans-serif',
            size: 12
          }
        },
        ticks: {
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          },
          callback: function(value) {
            return value % 5 === 0 || value === 0 ? value : '';
          },
          maxRotation: 0,
          padding: 5
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.3)',
        },
        ticks: {
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          },
          padding: 5
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1.5,
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    }
  };

  return (
    <div className="h-[50vh] p-4 bg-white">
      <Line 
        options={{
          ...options,
          maintainAspectRatio: false,
        }} 
        data={data} 
      />
    </div>
  );
};

export default PickHistoryGraph;
