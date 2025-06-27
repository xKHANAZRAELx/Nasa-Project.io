import { useState, useEffect } from 'react';
import axios from 'axios';

interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

const ApodPage = () => {
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchApodData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5001/api/apod`, {
          params: { date },
        });
        setApodData(response.data);
      } catch (err) {
        console.error('Error fetching APOD data:', err);
        setError('Failed to fetch the Astronomy Picture of the Day. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApodData();
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    setDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-space-black to-space-dark flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cosmic-blue mx-auto mb-4"></div>
          <p className="text-star-white text-lg">Exploring the cosmos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-space-black to-space-dark flex items-center justify-center p-4">
        <div className="max-w-md bg-space-dark bg-opacity-90 p-6 rounded-xl shadow-cosmic text-center">
          <p className="text-cosmic-red text-lg mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="px-4 py-2 bg-cosmic-blue text-star-white rounded-md hover:bg-cosmic-blue/80 transition-colors"
            aria-label="Retry fetching APOD data"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-black to-space-dark py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-cosmic-blue text-center mb-8">
          Astronomy Picture of the Day
        </h2>

        <div className="flex justify-center mb-8">
          <div className="relative flex items-center gap-3 bg-space-black bg-opacity-50 p-4 rounded-xl shadow-cosmic">
            <label htmlFor="date-input" className="text-cosmic-light-blue font-medium">
              Select Date:
            </label>
            <div className="relative">
              <input
                type="date"
                id="date-input"
                value={date}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10 pr-3 py-2 bg-space-dark border border-cosmic-blue/50 rounded-md text-star-white focus:outline-none focus:ring-2 focus:ring-cosmic-blue transition-all"
                aria-label="Select a date for APOD"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cosmic-light-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {apodData && (
          <div className="bg-space-black bg-opacity-70 rounded-xl p-6 shadow-cosmic">
            <h3 className="text-2xl font-semibold text-cosmic-blue mb-3">{apodData.title}</h3>
            <div className="flex flex-col sm:flex-row justify-between text-cosmic-light-blue mb-4">
              <p>Date: {apodData.date}</p>
              {apodData.copyright && (
                <p className="text-sm text-gray-400">© {apodData.copyright}</p>
              )}
            </div>

            {apodData.media_type === 'image' ? (
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden group">
                  <img
                    src={apodData.url}
                    alt={apodData.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {apodData.hdurl && (
                  <div className="mt-4 text-center">
                    <a
                      href={apodData.hdurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2 bg-cosmic-blue text-star-white rounded-md hover:bg-cosmic-blue/80 transition-colors"
                      aria-label="View high-definition image"
                    >
                      View HD Image
                    </a>
                  </div>
                )}
              </div>
            ) : apodData.media_type === 'video' ? (
              <div className="mb-6">
                <div className="relative rounded-xl overflow-hidden">
                  <iframe
                    src={apodData.url}
                    title={apodData.title}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-xl"
                  ></iframe>
                </div>
              </div>
            ) : (
              <p className="text-cosmic-red mb-4">
                Unsupported media type: {apodData.media_type}
              </p>
            )}

            <div className="bg-space-dark bg-opacity-50 p-5 rounded-xl">
              <h4 className="text-xl font-semibold text-cosmic-light-blue mb-3">
                Explanation
              </h4>
              <p className="text-star-white leading-relaxed">{apodData.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApodPage;