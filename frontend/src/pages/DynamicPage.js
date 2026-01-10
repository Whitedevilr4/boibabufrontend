import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/admin/pages/slug/${slug}`);
        setPage(response.data);
        
        // Update document title and meta description
        if (response.data.metaTitle) {
          document.title = response.data.metaTitle;
        }
        
        if (response.data.metaDescription) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', response.data.metaDescription);
          }
        }
      } catch (err) {
        setError(err.response?.status === 404 ? 'Page not found' : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {error === 'Page not found' ? '404' : 'Error'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-8 sm:py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {page.title}
            </h1>
            
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(page.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
