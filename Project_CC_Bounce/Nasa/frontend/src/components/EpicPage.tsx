import { useState, useEffect } from 'react';
import axios from 'axios';

interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  version: string;
  date: string;
  centroid_coordinates: {
    lat: number;
    lon: number;
  };
}

interface DateItem {
  date: string;
}

const EpicPage = () => {
  const [images, setImages] = useState<EpicImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<DateItem[]>([]);
  const [colorType, setColorType] = useState<'natural' | 'enhanced'>('natural');
  const [selectedImage, setSelectedImage] = useState<EpicImage | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Fetch available dates when component mounts or color type changes
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/epic/available`, {
          params: { color: colorType }
        });
        
        // API returns dates in descending order, we'll use the most recent 30
        const dates = response.data.slice(0, 30);
        setAvailableDates(dates);
        
        // Set the most recent date as default
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0].date);
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError('Failed to fetch available dates. Please try again later.');
      }
    };

    fetchAvailableDates();
  }, [colorType]);

  // Fetch images when selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchEpicImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Make sure selectedDate is a string
        const dateStr = String(selectedDate);
        const response = await axios.get(`http://localhost:5001/api/epic/date/${dateStr}`, {
          params: { color: colorType }
        });
        
        setImages(response.data);
        
        // Select the first image by default
        if (response.data.length > 0) {
          setSelectedImage(response.data[0]);
        } else {
          setSelectedImage(null);
          setImageUrl('');
        }
      } catch (err) {
        console.error('Error fetching EPIC images:', err);
        setError('Failed to fetch EPIC images. Please try again later.');
        setImages([]);
        setSelectedImage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEpicImages();
  }, [selectedDate, colorType]);

  // Fetch image URL when selected image changes
  useEffect(() => {
    if (!selectedImage) return;
    
    const fetchImageUrl = async () => {
      try {
        // Make sure selectedDate is a string
        const dateStr = String(selectedDate);
        const response = await axios.get(`http://localhost:5001/api/epic/image`, {
          params: {
            date: dateStr,
            imageName: selectedImage.image,
            color: colorType
          }
        });
        
        setImageUrl(response.data.imageUrl);
      } catch (err) {
        console.error('Error fetching image URL:', err);
        setImageUrl('');
      }
    };

    fetchImageUrl();
  }, [selectedImage, selectedDate, colorType]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleColorTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorType(e.target.value as 'natural' | 'enhanced');
  };

  const handleImageSelect = (image: EpicImage) => {
    setSelectedImage(image);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-black-400 mb-8">Earth Polychromatic Imaging Camera (EPIC)</h2>
      
      {/* Description */}
      <div className="mb-8 p-6 rounded-lg shadow-md">
        <p className="text-black mb-4">
          The EPIC (Earth Polychromatic Imaging Camera) provides full disc imagery of the Earth from the DSCOVR spacecraft, 
          positioned at the Earth-Sun Lagrange point. These images offer a unique perspective of our planet, 
          capturing stunning views that show the entire sunlit side of Earth.
        </p>
        <p className="text-black">
          EPIC takes images in 10 different wavelengths, from ultraviolet to near infrared. 
          The images displayed here are either in natural color or enhanced color, depending on your selection.
        </p>
      </div>
      
      {/* Controls */}
      <div className="rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl text-black-300 mb-4 font-semibold">Image Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label htmlFor="date-select" className="block text-black-300 font-medium">
              Date
            </label>
            <select 
              id="date-select" 
              value={selectedDate} 
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-black-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-black-500 transition-colors"
              disabled={availableDates.length === 0}
            >
              {availableDates.map((dateItem) => (
                <option key={dateItem.date} value={dateItem.date}>
                  {new Date(dateItem.date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {availableDates.length === 0 && (
              <p className="text-yellow-400 text-sm mt-1">Loading available dates...</p>
            )}
          </div>
          
          {/* Color Type Selection */}
          <div className="space-y-2">
            <label className="block text-black-300 font-medium mb-2">
              Color Type
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="natural"
                  checked={colorType === 'natural'}
                  onChange={handleColorTypeChange}
                  className="form-radio h-5 w-5 text-black-500"
                />
                <span className="ml-2 text-black">Natural</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="enhanced"
                  checked={colorType === 'enhanced'}
                  onChange={handleColorTypeChange}
                  className="form-radio h-5 w-5 text-black-500"
                />
                <span className="ml-2 text-black">Enhanced</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400 bg-gray-800 rounded-lg p-6">
          <p className="text-xl">{error}</p>
          <p className="mt-2">Try selecting a different date or color type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thumbnails */}
          <div className="lg:col-span-1 p-4 rounded-lg h-[600px] overflow-y-auto">
            <h3 className="text-xl text-black-300 mb-4 font-semibold">Available Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {images.map((image) => (
                <div 
                  key={`${image.identifier}-${image.date}`} 
                  onClick={() => handleImageSelect(image)}
                  className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${selectedImage?.identifier === image.identifier ? 'border-white-500 scale-[1.02]' : 'border-transparent hover:border-white-300'}`}
                >
                  <div className="relative pb-[100%]">
                    {/* We'll use a placeholder until the actual image loads */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-xs text-center p-1 text-gray-300">
                      {new Date(image.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {images.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No images available for this date.
              </div>
            )}
          </div>
          
          {/* Main Image Display */}
          <div className="lg:col-span-2 p-4 rounded-lg">
            {selectedImage && imageUrl ? (
              <div>
                <div className="relative pb-[75%] bg-black rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={selectedImage.caption} 
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-black-300 mb-2">
                    {formatDate(selectedImage.date)}
                  </h4>
                  <p className="text-black mb-3">{selectedImage.caption}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-black-300 font-medium">Coordinates</p>
                      <p className="text-black">
                        Lat: {selectedImage.centroid_coordinates.lat.toFixed(2)}°, 
                        Lon: {selectedImage.centroid_coordinates.lon.toFixed(2)}°
                      </p>
                    </div>
                    <div>
                      <p className="text-black-300 font-medium">Image ID</p>
                      <p className="text-black">{selectedImage.identifier}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-lg">Select an image to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EpicPage;
