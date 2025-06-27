import { useState, useEffect } from 'react';
import axios from 'axios';

interface ImageItem {
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  media_type: string;
  center: string;
  photographer?: string;
  keywords: string[];
  thumbnail?: string;
}

interface SearchResponse {
  collection: {
    items: {
      data: ImageItem[];
      links: { href: string; rel: string }[];
    }[];
    metadata: {
      total_hits: number;
    };
  };
}

const ImageLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('image');
  const [yearStart, setYearStart] = useState<string>('');
  const [yearEnd, setYearEnd] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [totalHits, setTotalHits] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchResults();
  };

  const fetchResults = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        q: searchQuery,
        page: currentPage
      };
      
      if (mediaType) params.media_type = mediaType;
      if (yearStart) params.year_start = yearStart;
      if (yearEnd) params.year_end = yearEnd;
      
      const response = await axios.get<SearchResponse>('http://localhost:5001/api/images/search', { params });
      
      const items = response.data.collection.items;
      const processedResults = await Promise.all(
        items.map(async (item) => {
          const result = {
            ...item.data[0],
            thumbnail: item.links?.find(link => link.rel === 'preview')?.href || ''
          };
          
          return result;
        })
      );
      
      setSearchResults(processedResults);
      setTotalHits(response.data.collection.metadata.total_hits);
    } catch (err) {
      console.error('Error searching NASA Image Library:', err);
      setError('Failed to fetch results. Please try again later.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = async (item: ImageItem) => {
    setSelectedItem(null);
    setLoading(true);
    
    try {
      const assetResponse = await axios.get(`http://localhost:5001/api/images/asset/${item.nasa_id}`);
      const assets = assetResponse.data.collection.items;
      
      // Get metadata if available
      let metadata = null;
      try {
        const metadataResponse = await axios.get(`http://localhost:5001/api/images/metadata/${item.nasa_id}`);
        metadata = metadataResponse.data;
      } catch (err) {
        console.warn('Metadata not available for this item');
      }
      
      // Get captions for videos if available
      let captions = null;
      if (item.media_type === 'video') {
        try {
          const captionsResponse = await axios.get(`http://localhost:5001/api/images/captions/${item.nasa_id}`);
          captions = captionsResponse.data;
        } catch (err) {
          console.warn('Captions not available for this video');
        }
      }
      
      setSelectedItem({
        ...item,
        assets,
        metadata,
        captions
      });
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to fetch item details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (searchQuery && currentPage > 0) {
      fetchResults();
    }
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">NASA Image and Video Library</h2>
      
      {/* Search Form */}
      <div className="mb-8 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search-query" className="block font-medium mb-1">
                Search Query
              </label>
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. mars, apollo, nebula"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                required
              />
            </div>
            
            <div>
              <label htmlFor="media-type" className="block font-medium mb-1">
                Media Type
              </label>
              <select
                id="media-type"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              >
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="">All Media Types</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="year-start" className="block font-medium mb-1">
                Year Start
              </label>
              <input
                id="year-start"
                type="number"
                min="1920"
                max={new Date().getFullYear()}
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                placeholder="e.g. 1969"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="year-end" className="block font-medium mb-1">
                Year End
              </label>
              <input
                id="year-end"
                type="number"
                min="1920"
                max={new Date().getFullYear()}
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                placeholder="e.g. 2023"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Results */}
      {error ? (
        <div className="text-center py-8 text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      ) : loading && !selectedItem ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg">
              Showing {searchResults.length} of {totalHits} results
            </p>
            
            {/* Pagination */}
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 border rounded-md bg-gray-100">
                Page {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={searchResults.length < 100} // NASA API typically returns 100 items per page
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((item) => (
              <div
                key={item.nasa_id}
                onClick={() => handleItemSelect(item)}
                className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative pb-[75%] bg-gray-100">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                      {item.media_type === 'video' ? 'Video' : 'No Preview'}
                    </div>
                  )}
                  {item.media_type === 'video' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Video
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(item.date_created)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery && !loading ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-xl">No results found for "{searchQuery}"</p>
          <p className="mt-2">Try adjusting your search terms or filters</p>
        </div>
      ) : null}
      
      {/* Selected Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedItem.title}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Media Display */}
              <div className="mb-6">
                {selectedItem.media_type === 'image' ? (
                  <img
                    src={selectedItem.assets?.find((asset: any) => 
                      asset.href.endsWith('.jpg') || asset.href.endsWith('.png')
                    )?.href || selectedItem.thumbnail}
                    alt={selectedItem.title}
                    className="w-full h-auto rounded-lg"
                  />
                ) : selectedItem.media_type === 'video' ? (
                  <video
                    controls
                    className="w-full h-auto rounded-lg"
                    poster={selectedItem.thumbnail}
                  >
                    <source
                      src={selectedItem.assets?.find((asset: any) => 
                        asset.href.endsWith('.mp4')
                      )?.href}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
                    <p>Audio content</p>
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="mt-1">{selectedItem.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Date</h4>
                    <p className="mt-1">{formatDate(selectedItem.date_created)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">NASA Center</h4>
                    <p className="mt-1">{selectedItem.center}</p>
                  </div>
                  
                  {selectedItem.photographer && (
                    <div>
                      <h4 className="font-medium">Photographer</h4>
                      <p className="mt-1">{selectedItem.photographer}</p>
                    </div>
                  )}
                </div>
                
                {selectedItem.keywords && selectedItem.keywords.length > 0 && (
                  <div>
                    <h4 className="font-medium">Keywords</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedItem.keywords.map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 px-2 py-1 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Download Links */}
                {selectedItem.assets && (
                  <div>
                    <h4 className="font-medium">Download Options</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedItem.assets.map((asset: any, index: number) => {
                        // Extract file extension
                        const extension = asset.href.split('.').pop()?.toUpperCase();
                        if (!extension) return null;
                        
                        return (
                          <a
                            key={index}
                            href={asset.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            {extension}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLibraryPage;