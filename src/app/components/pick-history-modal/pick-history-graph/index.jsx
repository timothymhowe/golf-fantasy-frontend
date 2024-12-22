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
  const chronologicalPicks = [...pastPicks];
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
        pointBackgroundColor: ['#9ca3af', ...chronologicalPicks.map(pick => {
          if (pick.pick_status?.is_no_pick) return '#FF4444';
          if (pick.result?.result === '1') return '#BFFF00';
          return '#9ca3af';
        })],
        pointHoverRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major ? 8 : 5
        )],
        pointRadius: [0, ...chronologicalPicks.map(pick => 
          pick.tournament.is_major ? 6 : 3
        )],
        pointStyle: [0, ...chronologicalPicks.map(pick => {
          if (pick.tournament.is_major) {
            return function(ctx) {
              const point = ctx.element;
              const { x, y } = point.tooltipPosition();
              const radius = point.options.radius;
              
              ctx.save();
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI * 2);
              ctx.fillStyle = pick.result?.result === '1' 
                ? '#BFFF00'
                : '#9ca3af';
              ctx.fill();
              
              ctx.beginPath();
              ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
              if (pick.pick_status?.is_no_pick) {
                ctx.fillStyle = '#FF4444';
              } else {
                ctx.fillStyle = '#1a1a1a';
              }
              ctx.fill();
              ctx.restore();
              return true;
            };
          }
          return 'circle';
        })],
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(156, 163, 175, 0.05)',
        tension: 0.1,
        fill: true,
        borderWidth: 1.5,
        pointBorderColor: '#1a1a1a',
        pointBorderWidth: 1,
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
        backgroundColor: '#1a1a1a',
        titleColor: '#d1d5db',
        bodyColor: '#d1d5db',
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
        borderColor: '#374151',
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
          color: 'rgba(255, 255, 255, 0.05)',
          drawTicks: true,
        },
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        title: {
          display: true,
          text: 'Week',
          color: '#9ca3af',
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          },
          padding: { top: 5 }
        },
        ticks: {
          color: '#9ca3af',
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
          color: 'rgba(255, 255, 255, 0.05)',
          lineWidth: 0.5
        },
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        title: {
          display: true,
          text: 'Points',
          color: '#9ca3af',
          font: {
            family: 'Verdana, sans-serif',
            size: 11
          }
        },
        ticks: {
          color: '#9ca3af',
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
    <div className={`${containerHeight} p-2 bg-black/40 transition-all duration-300 ease-in-out rounded`}>
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
