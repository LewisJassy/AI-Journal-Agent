const axios = require('axios');

const AI_SERVICE_URL = 'http://localhost:5000/api/ai'; // URL of the Python AI service

const aiService = {
    async processRequest(data) {
        try {
            const response = await axios.post(AI_SERVICE_URL, data);
            return response.data;
        } catch (error) {
            throw new Error('Error communicating with AI service: ' + error.message);
        }
    },

    async getResponse(input) {
        const requestData = { input };
        return await this.processRequest(requestData);
    }
};

module.exports = aiService;