import axiosInstance from './axiosInstance.js';

export const searchAPI = {
    searchAll: (query, limit = 5) => {
        return axiosInstance.get(`/search/all?q=${encodeURIComponent(query)}&limit=${limit}`);
    },

    searchCommunities: (query, limit = 5) => {
        return axiosInstance.get(`/search/communities?q=${encodeURIComponent(query)}&limit=${limit}`);
    },

    searchPosts: (query, limit = 5) => {
        return axiosInstance.get(`/search/posts?q=${encodeURIComponent(query)}&limit=${limit}`);
    },

    searchUsers: (query, limit = 5) => {
        return axiosInstance.get(`/search/users?q=${encodeURIComponent(query)}&limit=${limit}`);
    }
};