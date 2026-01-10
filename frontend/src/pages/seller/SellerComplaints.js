import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SellerComplaints = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch seller's complaints
  const { data: complaints, isLoading, refetch } = useQuery(
    'seller-complaints',
    async () => {
      const response = await api.get('/api/complaints/my-complaints');
      return response.data;
    },
    {
      enabled: !!user
    }
  );

  // Fetch seller's books for complaint form
  const { data: sellerBooks } = useQuery(
    'seller-books',
    async () => {
      const response = await api.get('/api/seller/books?limit=100');
      return response.data.books;
    },
    {
      enabled: !!user && showCreateForm
    }
  );

  // Fetch seller's orders for complaint form
  const { data: sellerOrders } = useQuery(
    'seller-orders',
    async () => {
      const response = await api.get('/api/seller/orders?limit=100');
      return response.data.orders;
    },
    {
      enabled: !!user && showCreateForm
    }
  );

  // Create complaint mutation
  const createComplaintMutation = useMutation(
    async (complaintData) => {
      const response = await api.post('/api/complaints', complaintData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Complaint submitted successfully');
        setShowCreateForm(false);
        reset();
        refetch();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit complaint');
      }
    }
  );

  const onSubmit = (data) => {
    // Clean up empty fields
    const cleanData = { ...data };
    if (!cleanData.orderId) delete cleanData.orderId;
    if (!cleanData.bookId) delete cleanData.bookId;
    
    createComplaintMutation.mutate(cleanData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'In Progress':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
      case 'Resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Closed':
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
            <p className="text-gray-600">Please wait while we load your data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">This page is only accessible to sellers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Support & Complaints</h1>
              <p className="text-gray-600">Submit and track your seller-related complaints</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Complaint
          </button>
        </div>
      </div>

      {/* Create Complaint Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Submit New Complaint</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your issue"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Commission Issue">Commission Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Platform Issue">Platform Issue</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Book Quality">Book Quality</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Order (Optional)
                  </label>
                  <select
                    {...register('orderId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an order (if applicable)</option>
                    {sellerOrders?.map(order => (
                      <option key={order._id} value={order._id}>
                        Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Book (Optional)
                  </label>
                  <select
                    {...register('bookId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a book (if applicable)</option>
                    {sellerBooks?.map(book => (
                      <option key={book._id} value={book._id}>
                        {book.title} by {book.author}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide detailed information about your complaint..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createComplaintMutation.isLoading}
                    className="btn-primary"
                  >
                    {createComplaintMutation.isLoading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Complaints</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading complaints...</p>
          </div>
        ) : complaints?.length === 0 ? (
          <div className="p-6 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints submitted yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "New Complaint" to submit your first complaint
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {complaints?.map((complaint) => (
              <div key={complaint._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(complaint.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {complaint.subject}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 overflow-hidden" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {complaint.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {complaint.category}</span>
                      <span>•</span>
                      <span>Status: {complaint.status}</span>
                      <span>•</span>
                      <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      {complaint.orderId && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            Order #{complaint.orderId.orderNumber}
                          </span>
                        </>
                      )}
                      {complaint.bookId && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            {complaint.bookId.title}
                          </span>
                        </>
                      )}
                    </div>

                    {complaint.adminResponse && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
                        {complaint.adminResponseDate && (
                          <p className="text-xs text-blue-600 mt-1">
                            Responded on {new Date(complaint.adminResponseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerComplaints;
