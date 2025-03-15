import React, { useEffect, useState, useRef, useCallback } from 'react';
import image_names from '../image_names';

const ImageSearchApp = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [kValue, setKValue] = useState(10);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  // Cloudinary configuration
  const cloudName = 'du9ikhnkq';
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const folderName = 'image_search_app'; // Update this to your Cloudinary folder name

  const lastImageElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    const loadImages = () => {
      const limit = 10;
      const start = (page - 1) * limit;
      const end = page * limit;
      const newImages = image_names.slice(start, end);
      setImages((prevImages) => [...prevImages, ...newImages]);
      setHasMore(end < image_names.length);
    };

    loadImages();
  }, [page]);

  useEffect(() => {
    const debounceSearch = setTimeout(async () => {
      if (query.trim() === '') {
        setFilteredImages(images);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/?query=${encodeURIComponent(query)}&k=${kValue}`);
        const data = await response.json();
        setFilteredImages(data.images);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [query, images, kValue]);

  // Function to get Cloudinary URL for an image
  const getCloudinaryUrl = (imageName) => {
    // Remove file extension for public_id
    const publicId = imageName.split('.')[0];
    
    // Construct the URL with transformations
    // auto format and quality for optimization
    return `${cloudinaryUrl}/f_auto,q_auto/${folderName}/${publicId}`;
  };

  // Add Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-lg">
            Developed by{' '}
            <a href="https://github.com/dagim19" className="text-blue-600 hover:text-blue-800 transition-colors">
              Dagim Ashenafi
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Based on the{' '}
            <a href="https://unsplash.com/data" className="text-blue-600 hover:text-blue-800 transition-colors">
              Unsplash Lite dataset
            </a>
          </p>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 tracking-tight">Semantic Image Search</h1>
        
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search images with natural language
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Try 'sunset over mountains' or 'dog in the park'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {loading ? (
                <div className="absolute right-3 top-3 animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="kValue" className="block text-sm font-medium text-gray-700 mb-2">
              Number of results to display (K)
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-full">
                <input
                  id="kValue"
                  type="range"
                  min="1"
                  max="50"
                  value={kValue}
                  onChange={(e) => setKValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="relative w-full flex justify-between mt-1 px-1">
                  <span className="text-xs text-gray-500">1</span>
                  <span className="text-xs text-gray-500">10</span>
                  <span className="text-xs text-gray-500">20</span>
                  <span className="text-xs text-gray-500">30</span>
                  <span className="text-xs text-gray-500">40</span>
                  <span className="text-xs text-gray-500">50</span>
                </div>
              </div>
              <div className="w-12 p-2 bg-blue-100 text-blue-800 text-center rounded-md font-medium">
                {kValue}
              </div>
            </div>
          </div>
        </div>

        {loading && filteredImages.length === 0 && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="masonry-grid columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredImages.map((image, index) => {
            const isLastElement = filteredImages.length === index + 1;
            return (
              <div 
                key={index} 
                ref={isLastElement ? lastImageElementRef : null}
                className="break-inside-avoid mb-6"
              >
                <img
                  src={getCloudinaryUrl(image)}
                  alt={`Search result ${index + 1}`}
                  className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>

        {hasMore && !loading && filteredImages.length > 0 && (
          <div className="text-center my-8">
            <div className="inline-block animate-bounce bg-blue-100 p-2 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-gray-600 mt-2">Scroll for more images</p>
          </div>
        )}
        
        {!loading && filteredImages.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No images found matching your search.</p>
            <p className="text-gray-500">Try a different search term or adjust the K value.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSearchApp;