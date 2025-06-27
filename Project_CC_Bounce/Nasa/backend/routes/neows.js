const express = require('express');
const axios = require('axios');
const router = express.Router();

const fetchNasaData = async (endpoint, params = {}) => {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const baseUrl = 'https://api.nasa.gov';
  
  try {
    const response = await axios.get(`${baseUrl}/${endpoint}`, {
      params: {
        api_key: apiKey,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching NASA data: ${error.message}`);
    throw error;
  }
};

router.get('/feed', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Both start_date and end_date are required' 
      });
    }
    
    const data = await fetchNasaData('neo/rest/v1/feed', { 
      start_date, 
      end_date 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get information about a specific asteroid by ID
router.get('/asteroid/:asteroid_id', async (req, res, next) => {
  try {
    const data = await fetchNasaData(`neo/rest/v1/neo/${req.params.asteroid_id}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/browse', async (req, res, next) => {
  try {
    const { page = 0, size = 20 } = req.query;
    const data = await fetchNasaData('neo/rest/v1/neo/browse', { page, size });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const data = await fetchNasaData('neo/rest/v1/stats');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
