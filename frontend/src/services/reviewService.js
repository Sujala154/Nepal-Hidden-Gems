import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },
  getReviewsByDestination: async (destinationId) => {
    return await api.get(`/reviews/${destinationId}`);
  }
};
