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

router.get('/', async (req, res, next) => {
  try {
    const data = await fetchNasaData('planetary/apod', req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/date/:date', async (req, res, next) => {
  try {
    const data = await fetchNasaData('planetary/apod', { date: req.params.date });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/range', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Both start_date and end_date are required' 
      });
    }
    
    const data = await fetchNasaData('planetary/apod', { 
      start_date, 
      end_date 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
