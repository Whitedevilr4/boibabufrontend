import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import BookCard from '../components/books/BookCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { BOOK_CATEGORIES } from '../constants/categories';

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || '',
    bestseller: searchParams.get('bestseller') || '',
    newArrival: searchParams.get('newArrival') || ''
  });
  const [viewMode, setViewMode] = useState('grid');

  // Fetch books
  const { data, isLoading, error } = useQuery(
    ['books', filters],
    () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/books?${params}`).then(res => res.data);
    },
    { keepPreviousData: true }
  );

  // Fetch categories with fallback
  const { data: apiCategories } = useQuery(
    'categories',
    () => api.get('/api/categories').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      onError: () => {
        // Silently fail, we'll use fallback
      }
    }
  );

  // Use API categories if available, otherwise fall back to static categories
  const categories = React.useMemo(() => {
    if (apiCategories && Array.isArray(apiCategories) && apiCategories.length > 0) {
      return apiCategories;
    }
    // Fallback to static categories
    return BOOK_CATEGORIES.map(name => ({ _id: name, name }));
  }, [apiCategories]);

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && key !== 'page' && key !== 'limit') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Generate SEO metadata based on current filters
  const generateSEOData = () => {
    let title = 'Buy Books Online - BoiBabu.in';
    let description = 'Buy books online at BoiBabu.in - India\'s largest bookstore with best prices, free shipping & fast delivery.';
    let keywords = 'buy books online, online bookstore India, books online, BoiBabu';

    if (filters.search) {
      title = `${filters.search} Books - Buy Online at BoiBabu.in`;
      description = `Find ${filters.search} books online at BoiBabu.in. Best prices, free shipping, and fast delivery across India.`;
      keywords = `${filters.search} books, buy ${filters.search} online, ${filters.search} book store, ${keywords}`;
    } else if (filters.category) {
      title = `${filters.category} Books - Buy Online at BoiBabu.in`;
      description = `Shop ${filters.category} books online at BoiBabu.in. Huge collection of ${filters.category} books with best prices and free shipping.`;
      keywords = `${filters.category} books, buy ${filters.category} books online, ${filters.category} book store, ${keywords}`;
    } else if (filters.featured) {
      title = 'Featured Books - Buy Online at BoiBabu.in';
      description = 'Discover featured books at BoiBabu.in. Handpicked collection of the best books with special offers and free shipping.';
      keywords = `featured books, recommended books, best books, ${keywords}`;
    } else if (filters.bestseller) {
      title = 'Bestseller Books - Buy Online at BoiBabu.in';
      description = 'Shop bestseller books at BoiBabu.in. Popular and trending books with best prices and free shipping across India.';
      keywords = `bestseller books, popular books, trending books, ${keywords}`;
    } else if (filters.newArrival) {
      title = 'New Arrival Books - Buy Online at BoiBabu.in';
      description = 'Latest new arrival books at BoiBabu.in. Fresh collection of newly released books with best prices and free shipping.';
      keywords = `new books, latest books, new arrivals, ${keywords}`;
    }

    return { title, description, keywords };
  };

  const seoData = generateSEOData();

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={`https://boibabu.in/books${window.location.search}`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content={`https://boibabu.in/books${window.location.search}`} />
        <meta property="og:type" content="website" />
        
        {/* Twitter tags */}
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        
        {/* Structured data for book collection */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": seoData.title,
            "description": seoData.description,
            "url": `https://boibabu.in/books${window.location.search}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": data?.pagination?.total || 0,
              "itemListElement": data?.books?.slice(0, 10).map((book, index) => ({
                "@type": "Book",
                "position": index + 1,
                "name": book.title,
                "author": book.author,
                "isbn": book.isbn,
                "publisher": book.publisher,
                "offers": {
                  "@type": "Offer",
                  "price": book.price,
                  "priceCurrency": "INR",
                  "availability": book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              })) || []
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {filters.search ? `Search Results for "${filters.search}"` : 'All Books'}
          </h1>
          
          {/* Filters Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="form-input text-sm sm:text-base"
              >
                <option value="">All Categories</option>
                {categories?.map(category => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateFilters({ sortBy, sortOrder });
                }}
                className="form-input text-sm sm:text-base"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
              </select>

              {/* Price Range */}
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="form-input text-sm sm:text-base flex-1"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="form-input text-sm sm:text-base flex-1"
                />
              </div>

              {/* Special Filters */}
              <div className="flex flex-wrap gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
                <label className="flex items-center text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={filters.featured === 'true'}
                    onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : '' })}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center text-sm sm:text-base">
                  <input
                    type="checkbox"
                    checked={filters.bestseller === 'true'}
                    onChange={(e) => updateFilters({ bestseller: e.target.checked ? 'true' : '' })}
                    className="mr-2"
                  />
                  Bestseller
                </label>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <p className="text-sm sm:text-base text-gray-600">
              {data ? `Showing ${data.books?.length || 0} of ${data.pagination?.total || 0} books` : ''}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="List view"
              >
                <ListBulletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-12 sm:py-20" />
        ) : error ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-red-600 text-sm sm:text-base">Error loading books. Please try again.</p>
          </div>
        ) : data?.books?.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-gray-600 text-sm sm:text-base">No books found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {data?.books?.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination?.pages > 1 && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                  {/* Previous button */}
                  {filters.page > 1 && (
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      ←
                    </button>
                  )}
                  
                  {Array.from({ length: Math.min(data.pagination.pages, 7) }, (_, i) => {
                    let page;
                    if (data.pagination.pages <= 7) {
                      page = i + 1;
                    } else if (filters.page <= 4) {
                      page = i + 1;
                    } else if (filters.page >= data.pagination.pages - 3) {
                      page = data.pagination.pages - 6 + i;
                    } else {
                      page = filters.page - 3 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-sm sm:text-base rounded transition-colors ${
                          page === filters.page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {/* Next button */}
                  {filters.page < data.pagination.pages && (
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default BooksPage;
