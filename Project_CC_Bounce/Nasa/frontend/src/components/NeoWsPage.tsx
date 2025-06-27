import { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface NeoFeed {
  element_count: number;
  links: {
    next: string;
    prev: string;
    self: string;
  };
  near_earth_objects: {
    [date: string]: NearEarthObject[];
  };
}

interface NearEarthObject {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    miles: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    feet: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
      miles_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      lunar: string;
      kilometers: string;
      miles: string;
    };
    orbiting_body: string;
  }[];
  is_sentry_object: boolean;
}

interface NeoStats {
  near_earth_object_count: number;
  close_approach_count: number;
  last_updated: string;
  source: string;
  nasa_jpl_url: string;
}

const NeoWsPage = () => {
  const [neoFeed, setNeoFeed] = useState<NeoFeed | null>(null);
  const [neoStats, setNeoStats] = useState<NeoStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchNeoData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch NEO feed data for the date range
        const feedResponse = await axios.get(`http://localhost:5001/api/neo/feed`, {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        });
        setNeoFeed(feedResponse.data);

        // Fetch NEO stats
        const statsResponse = await axios.get(`http://localhost:5001/api/neo/stats`);
        setNeoStats(statsResponse.data);
      } catch (err) {
        console.error('Error fetching NEO data:', err);
        setError('Failed to fetch Near Earth Object data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNeoData();
  }, [startDate, endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // Prepare data for charts
  const prepareAsteroidCountChart = () => {
    if (!neoFeed) return null;

    const dates = Object.keys(neoFeed.near_earth_objects).sort();
    const counts = dates.map(date => neoFeed.near_earth_objects[date].length);

    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Number of Asteroids',
          data: counts,
          backgroundColor: 'rgba(0, 180, 216, 0.6)',
          borderColor: 'rgba(0, 180, 216, 1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Asteroids per Day',
          color: '#f5f5f5',
          font: {
            size: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#f5f5f5',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        x: {
          ticks: {
            color: '#f5f5f5',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    };

    return { data, options };
  };

  const prepareHazardousChart = () => {
    if (!neoFeed) return null;

    let hazardousCount = 0;
    let nonHazardousCount = 0;

    Object.values(neoFeed.near_earth_objects).flat().forEach(neo => {
      if (neo.is_potentially_hazardous_asteroid) {
        hazardousCount++;
      } else {
        nonHazardousCount++;
      }
    });

    const data = {
      labels: ['Potentially Hazardous', 'Not Hazardous'],
      datasets: [
        {
          data: [hazardousCount, nonHazardousCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#f5f5f5',
          },
        },
        title: {
          display: true,
          text: 'Potentially Hazardous Asteroids',
          color: '#f5f5f5',
          font: {
            size: 16,
          },
        },
      },
    };

    return { data, options };
  };

  const prepareSizeDistributionChart = () => {
    if (!neoFeed) return null;

    const sizeRanges = [
      { min: 0, max: 50, label: '0-50m' },
      { min: 50, max: 100, label: '50-100m' },
      { min: 100, max: 500, label: '100-500m' },
      { min: 500, max: 1000, label: '500m-1km' },
      { min: 1000, max: Infinity, label: '>1km' },
    ];

    const sizeCounts = Array(sizeRanges.length).fill(0);

    Object.values(neoFeed.near_earth_objects).flat().forEach(neo => {
      const avgDiameter = (
        neo.estimated_diameter.meters.estimated_diameter_min +
        neo.estimated_diameter.meters.estimated_diameter_max
      ) / 2;

      for (let i = 0; i < sizeRanges.length; i++) {
        if (avgDiameter >= sizeRanges[i].min && avgDiameter < sizeRanges[i].max) {
          sizeCounts[i]++;
          break;
        }
      }
    });

    const data = {
      labels: sizeRanges.map(range => range.label),
      datasets: [
        {
          label: 'Number of Asteroids',
          data: sizeCounts,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Asteroid Size Distribution',
          color: '#f5f5f5',
          font: {
            size: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#f5f5f5',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        x: {
          ticks: {
            color: '#f5f5f5',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    };

    return { data, options };
  };

  const asteroidCountChart = prepareAsteroidCountChart();
  const hazardousChart = prepareHazardousChart();
  const sizeDistributionChart = prepareSizeDistributionChart();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-space-dark bg-opacity-70 rounded-lg shadow-cosmic">
        <h2 className="text-center text-cosmic-blue mb-6">Near Earth Objects</h2>
        <div className="text-center py-8 text-lg">Loading NEO data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-space-dark bg-opacity-70 rounded-lg shadow-cosmic">
        <h2 className="text-center text-cosmic-blue mb-6">Near Earth Objects</h2>
        <div className="text-center py-8 text-cosmic-red">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-space-dark bg-opacity-70 rounded-lg shadow-cosmic">
      <h2 className="text-center text-cosmic-blue mb-6">Near Earth Objects</h2>
      
      <div className="flex flex-wrap justify-center gap-6 p-4 mb-6 bg-space-black bg-opacity-30 rounded-lg">
        <div className="flex flex-col gap-2">
          <label htmlFor="start-date" className="text-cosmic-light-blue">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
            max={endDate}
            className="px-3 py-2 bg-space-dark border border-cosmic-blue rounded-md text-star-white focus:outline-none focus:ring-2 focus:ring-cosmic-blue"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="end-date" className="text-cosmic-light-blue">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 bg-space-dark border border-cosmic-blue rounded-md text-star-white focus:outline-none focus:ring-2 focus:ring-cosmic-blue"
          />
        </div>
      </div>
      
      {neoFeed && (
        <div className="flex flex-wrap justify-around gap-4 mb-8">
          <div className="bg-space-black bg-opacity-50 rounded-lg p-4 min-w-[200px] text-center shadow-lg border-l-4 border-cosmic-blue">
            <h3 className="text-cosmic-light-blue text-lg mb-2">Total Asteroids</h3>
            <p className="text-3xl font-bold">{neoFeed.element_count}</p>
          </div>
          
          {neoStats && (
            <div className="bg-space-black bg-opacity-50 rounded-lg p-4 min-w-[200px] text-center shadow-lg border-l-4 border-cosmic-blue">
              <h3 className="text-cosmic-light-blue text-lg mb-2">Total NEOs in Database</h3>
              <p className="text-3xl font-bold">{neoStats.near_earth_object_count.toLocaleString()}</p>
            </div>
          )}
          
          {neoStats && (
            <div className="bg-space-black bg-opacity-50 rounded-lg p-4 min-w-[200px] text-center shadow-lg border-l-4 border-cosmic-blue">
              <h3 className="text-cosmic-light-blue text-lg mb-2">Close Approaches</h3>
              <p className="text-3xl font-bold">{neoStats.close_approach_count.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {asteroidCountChart && (
          <div className="bg-space-black bg-opacity-30 rounded-lg p-4 shadow-lg col-span-1 lg:col-span-2">
            <Bar data={asteroidCountChart.data} options={asteroidCountChart.options} />
          </div>
        )}
        
        {hazardousChart && (
          <div className="bg-space-black bg-opacity-30 rounded-lg p-4 shadow-lg">
            <Pie data={hazardousChart.data} options={hazardousChart.options} />
          </div>
        )}
        
        {sizeDistributionChart && (
          <div className="bg-space-black bg-opacity-30 rounded-lg p-4 shadow-lg col-span-1 lg:col-span-3">
            <Bar data={sizeDistributionChart.data} options={sizeDistributionChart.options} />
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h3 className="text-center text-cosmic-blue text-xl mb-4">Asteroids List</h3>
        <div className="overflow-x-auto">
          <table className="w-full bg-space-black bg-opacity-30 rounded-lg">
            <thead>
              <tr className="bg-space-black bg-opacity-50">
                <th className="p-3 text-left text-cosmic-light-blue font-bold">Name</th>
                <th className="p-3 text-left text-cosmic-light-blue font-bold">Date</th>
                <th className="p-3 text-left text-cosmic-light-blue font-bold">Diameter (m)</th>
                <th className="p-3 text-left text-cosmic-light-blue font-bold">Miss Distance (km)</th>
                <th className="p-3 text-left text-cosmic-light-blue font-bold">Hazardous</th>
              </tr>
            </thead>
            <tbody>
              {neoFeed && Object.entries(neoFeed.near_earth_objects).map(([date, asteroids]) =>
                asteroids.map(asteroid => (
                  <tr key={asteroid.id} className="border-b border-space-dark hover:bg-space-black hover:bg-opacity-50">
                    <td className="p-3">{asteroid.name}</td>
                    <td className="p-3">{date}</td>
                    <td className="p-3">
                      {Math.round((asteroid.estimated_diameter.meters.estimated_diameter_min + 
                        asteroid.estimated_diameter.meters.estimated_diameter_max) / 2)}
                    </td>
                    <td className="p-3">
                      {parseInt(asteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()}
                    </td>
                    <td className={`p-3 ${asteroid.is_potentially_hazardous_asteroid ? 'text-cosmic-red font-bold' : 'text-cosmic-green'}`}>
                      {asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NeoWsPage;
