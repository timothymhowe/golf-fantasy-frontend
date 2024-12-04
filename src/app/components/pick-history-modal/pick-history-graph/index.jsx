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

const PickHistoryGraph = ({ picks, containerHeight = "h-[50vh]" }) => {
  const pastPicks = picks.filter(pick => !pick.is_future);
  const chronologicalPicks = [...pastPicks].reverse();
  const cumulativePoints = chronologicalPicks.reduce((acc, pick, index) => {
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    acc.push(previousTotal + pick.points);
    return acc;
  }, []);

  const photoCache = useRef(new Map());

  useEffect(() => {
    pastPicks.forEach(pick => {
      if (pick.golfer?.datagolf_id && !photoCache.current.has(pick.golfer.datagolf_id)) {
        getGolferPhotoUrl(pick.golfer.datagolf_id).then(url => {
          photoCache.current.set(pick.golfer.datagolf_id, url);
        });
      }
    });
  }, [pastPicks]);

  const data = {
    labels: ['0', ...chronologicalPicks.map((_, index) => (index + 1).toString())],
    datasets: [
      {
        label: 'Total Points',
        data: [0, ...cumulativePoints],
        pointBackgroundColor: ['rgb(59, 130, 246)', ...chronologicalPicks.map(pick => {
          if (pick.result?.result === '1') return 'rgb(234, 179, 8)';
          if (pick.tournament.is_major) return 'rgb(239, 68, 68)';
          return 'rgb(59, 130, 246)';
        })],
        pointHoverRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major || pick.result?.result === '1' ? 7 : 5
        )],
        pointRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major || pick.result?.result === '1' ? 5 : 3
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
        display: false
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
              `${pick.golfer?.name || 'No Pick'}`,
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
          color: 'rgba(0, 0, 0, 0.05)',
          drawTicks: true,
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Week',
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          },
          padding: { top: 5 }
        },
        ticks: {
          font: {
            family: 'Verdana, sans-serif',
            size: 10
          },
          callback: function(value) {
            return value % 5 === 0 || value === 0 ? value : '';
          },
          maxRotation: 0,
          padding: 3
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 0.5
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Points',
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          }
        },
        ticks: {
          font: {
            family: 'Verdana, sans-serif',
            size: 10
          },
          padding: 3,
          maxTicksLimit: 8
        }
      }
    },
    layout: {
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      }
    }
  };

  return (
    <div className={`${containerHeight} p-2 bg-white transition-all duration-300 ease-in-out`}>
      <Line 
        options={{
          ...options,
          maintainAspectRatio: false,
          animation: {
            duration: 300
          }
        }} 
        data={data} 
      />
    </div>
  );
};

export default PickHistoryGraph;
