import axios from 'axios';

const API_BASE_URL = 'https://saisuchendar-final-api.hf.space';

export const getRecommendations = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations/${userId}`);
        // Response: { user_id, recommendations: [{ item_id, score, rank }, ...], source, strategy }
        const data = response.data;
        if (data.recommendations && Array.isArray(data.recommendations)) {
            return data.recommendations.map(rec => rec.item_id);
        }
        return [];
    } catch (error) {
        console.error('Error calling recommendation API for recommendations:', error.message);
        return [];
    }
};

export const refreshRecommendations = async (userId) => {
    try {
        await axios.post(`${API_BASE_URL}/recommendations/refresh/${userId}`);
        console.log(`Recommendations refreshed for user ${userId}`);
    } catch (error) {
        console.error('Error refreshing recommendations:', error.message);
    }
};