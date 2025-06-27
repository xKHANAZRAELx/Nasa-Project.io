import { useState, useEffect } from 'react';
import axios from 'axios';

interface RoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

interface RoverData {
  photos: RoverPhoto[];
}

interface RoverManifest {
  photo_manifest: {
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
    photos: Array<{
      sol: number;
      earth_date: string;
      total_photos: number;
      cameras: string[];
    }>;
  };
}

const MarsRoverPage = () => {
  const [photos, setPhotos] = useState<RoverPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rover, setRover] = useState<string>('curiosity');
  const [sol, setSol] = useState<number>(1000);
  const [earthDate, setEarthDate] = useState<string>('');
  const [camera, setCamera] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [dateType, setDateType] = useState<'sol' | 'earth_date'>('sol');
  const [manifest, setManifest] = useState<RoverManifest | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  const rovers = ['curiosity', 'opportunity', 'spirit'];
  const cameras = [
    { value: '', label: 'All Cameras' },
    { value: 'FHAZ', label: 'Front Hazard Avoidance Camera' },
    { value: 'RHAZ', label: 'Rear Hazard Avoidance Camera' },
    { value: 'MAST', label: 'Mast Camera' },
    { value: 'CHEMCAM', label: 'Chemistry and Camera Complex' },
    { value: 'MAHLI', label: 'Mars Hand Lens Imager' },
    { value: 'MARDI', label: 'Mars Descent Imager' },
    { value: 'NAVCAM', label: 'Navigation Camera' },
    { value: 'PANCAM', label: 'Panoramic Camera' },
    { value: 'MINITES', label: 'Miniature Thermal Emission Spectrometer' },
  ];

  // Fetch rover manifest when rover changes
  useEffect(() => {
    const fetchRoverManifest = async () => {
      try {
        const response = await axios.get<RoverManifest>(
          `http://localhost:5001/api/mars-rover/manifest/${rover}`
        );
        setManifest(response.data);
        
        // Set default values based on manifest
        if (response.data.photo_manifest) {
          const maxSol = response.data.photo_manifest.max_sol;
          const maxDate = response.data.photo_manifest.max_date;
          
          // Update sol and earth_date with valid values from manifest
          setSol(Math.min(sol, maxSol));
          if (!earthDate) {
            setEarthDate(maxDate);
          }
        }
      } catch (err) {
        console.error('Error fetching rover manifest:', err);
      }
    };

    fetchRoverManifest();
  }, [rover]);

  // Fetch photos when search parameters change
  useEffect(() => {
    const fetchRoverPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          rover,
          page,
        };
        
        // Add either sol or earth_date based on dateType
        if (dateType === 'sol') {
          params.sol = sol;
        } else {
          params.earth_date = earthDate;
        }
        
        // Add camera if selected
        if (camera) {
          params.camera = camera;
        }
        
        const response = await axios.get<RoverData>(`http://localhost:5001/api/mars-rover`, {
          params
        });
        
        setPhotos(response.data.photos || []);
        
        // Estimate total pages based on photos returned
        // NASA API returns max 25 photos per page
        if (response.data.photos?.length === 25) {
          setTotalPages(page + 1); // There might be more pages
        } else if (page > 1 && response.data.photos?.length === 0) {
          setTotalPages(page - 1); // We've gone too far
        } else if (page === 1 && response.data.photos?.length === 0) {
          setTotalPages(1); // No photos found
        }
        
        if (response.data.photos?.length === 0) {
          const dateInfo = dateType === 'sol' ? `sol ${sol}` : `date ${earthDate}`;
          setError(`No photos found for ${rover} rover on ${dateInfo}${camera ? ` with ${camera} camera` : ''}`);
        }
      } catch (err: any) {
        console.error('Error fetching Mars rover photos:', err);
        const errorMessage = err.response?.data?.error || 'Failed to fetch Mars rover photos. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRoverPhotos();
  }, [rover, sol, earthDate, camera, page, dateType]);

  const handleRoverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRover(e.target.value);
    setPage(1); // Reset to first page when changing rover
  };

  const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSol(parseInt(e.target.value));
    setPage(1); // Reset to first page when changing sol
  };

  const handleEarthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEarthDate(e.target.value);
    setPage(1); // Reset to first page when changing date
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCamera(e.target.value);
    setPage(1); // Reset to first page when changing camera
  };

  const handleDateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateType(e.target.value as 'sol' | 'earth_date');
    setPage(1); // Reset to first page when changing date type
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-black-400 mb-8">Mars Rover Photos</h2>
      
      {/* Search Controls */}
      <div className="rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl text-black-300 mb-4 font-semibold">Search Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rover Selection */}
          <div className="space-y-2">
            <label htmlFor="rover-select" className="block text-black-300 font-medium">
              Rover
            </label>
            <select 
              id="rover-select" 
              value={rover} 
              onChange={handleRoverChange}
              className="w-full px-4 py-2 bg-white-700 border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
            >
              {rovers.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Type Selection */}
          <div className="space-y-2">
            <label htmlFor="date-type-select" className="block text-black-300 font-medium">
              Date Type
            </label>
            <select 
              id="date-type-select" 
              value={dateType} 
              onChange={handleDateTypeChange}
              className="w-full px-4 py-2 border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
            >
              <option value="sol">Martian Sol</option>
              <option value="earth_date">Earth Date</option>
            </select>
          </div>
          
          {/* Sol or Earth Date Input */}
          {dateType === 'sol' ? (
            <div className="space-y-2">
              <label htmlFor="sol-input" className="block text-black-300 font-medium">
                Sol
              </label>
              <input 
                type="number" 
                id="sol-input" 
                value={sol} 
                onChange={handleSolChange}
                min="0"
                max={manifest?.photo_manifest?.max_sol || 3000}
                className="w-full px-4 py-2  border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="earth-date-input" className="block text-black-300 font-medium">
                Earth Date
              </label>
              <input 
                type="date" 
                id="earth-date-input" 
                value={earthDate} 
                onChange={handleEarthDateChange}
                className="w-full px-4 py-2  border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
              />
            </div>
          )}
          
          {/* Camera Selection */}
          <div className="space-y-2">
            <label htmlFor="camera-select" className="block text-black-300 font-medium">
              Camera
            </label>
            <select 
              id="camera-select" 
              value={camera} 
              onChange={handleCameraChange}
              className="w-full px-4 py-2  border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
            >
              {cameras.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Rover Information */}
      {manifest && (
        <div className="mb-8 p-6 rounded-lg shadow-md">
          <h3 className="text-xl text-black-300 mb-4 font-semibold">Rover Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className=" p-4 rounded-md">
              <p className="mb-2"><span className="font-bold text-black-300">Status:</span> <span className="text-black">{manifest.photo_manifest.status}</span></p>
              <p><span className="font-bold text-black-300">Total Photos:</span> <span className="text-black">{manifest.photo_manifest.total_photos.toLocaleString()}</span></p>
            </div>
            <div className=" p-4 rounded-md">
              <p className="mb-2"><span className="font-bold text-black-300">Launch Date:</span> <span className="text-black">{manifest.photo_manifest.launch_date}</span></p>
              <p><span className="font-bold text-black-300">Landing Date:</span> <span className="text-black">{manifest.photo_manifest.landing_date}</span></p>
            </div>
            <div className=" p-4 rounded-md">
              <p className="mb-2"><span className="font-bold text-black-300">Max Sol:</span> <span className="text-black">{manifest.photo_manifest.max_sol}</span></p>
              <p><span className="font-bold text-black-300">Last Earth Date:</span> <span className="text-black">{manifest.photo_manifest.max_date}</span></p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400 rounded-lg p-6">
          <p className="text-xl">{error}</p>
          <p className="mt-2">Try changing your search parameters.</p>
        </div>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative pb-[60%] overflow-hidden">
                  <img 
                    src={photo.img_src} 
                    alt={`${photo.rover.name} rover - ${photo.camera.full_name}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="mb-2"><span className="font-bold text-black-300">Date:</span> <span className="text-black">{photo.earth_date}</span></p>
                  <p className="mb-2"><span className="font-bold text-black-300">Camera:</span> <span className="text-black">{photo.camera.full_name}</span></p>
                  <p><span className="font-bold text-black-300">Sol:</span> <span className="text-black">{photo.sol}</span></p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {photos.length > 0 && (
            <div className="flex justify-center mt-8 gap-4">
              <button 
                onClick={handlePrevPage} 
                disabled={page <= 1}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${page <= 1 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-black-600 text-black hover:bg-black-700'}`}
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2  rounded-md text-black">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={photos.length < 25}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${photos.length < 25 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-black-600 text-black hover:bg-black-700'}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {/* No Results Message */}
      {!loading && !error && photos.length === 0 && (
        <div className="text-center py-12 rounded-lg">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-xl text-black-300">
            No photos found for the selected criteria.
          </p>
          <p className="mt-2 text-gray-400">
            Try changing the rover, date, or camera.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarsRoverPage;
