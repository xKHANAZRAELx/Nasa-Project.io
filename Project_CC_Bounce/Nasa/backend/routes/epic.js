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
    const { color = 'natural' } = req.query;
    
    if (!['natural', 'enhanced'].includes(color)) {
      return res.status(400).json({ error: 'Color parameter must be either "natural" or "enhanced"' });
    }
    
    const data = await fetchNasaData(`EPIC/api/${color}`);
    res.json(data);
  } catch (error) {
    console.error('EPIC API error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Error fetching EPIC data' 
      });
    } else {
      next(error);
    }
  }
});

router.get('/date/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    const { color = 'natural' } = req.query;
    
    if (!['natural', 'enhanced'].includes(color)) {
      return res.status(400).json({ error: 'Color parameter must be either "natural" or "enhanced"' });
    }
    
    const data = await fetchNasaData(`EPIC/api/${color}/date/${date}`);
    res.json(data);
  } catch (error) {
    console.error('EPIC API error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Error fetching EPIC data for date' 
      });
    } else {
      next(error);
    }
  }
});

router.get('/available', async (req, res, next) => {
  try {
    const { color = 'natural' } = req.query;
    
    if (!['natural', 'enhanced'].includes(color)) {
      return res.status(400).json({ error: 'Color parameter must be either "natural" or "enhanced"' });
    }
    
    const data = await fetchNasaData(`EPIC/api/${color}/all`);
    res.json(data);
  } catch (error) {
    console.error('EPIC API error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Error fetching EPIC available dates' 
      });
    } else {
      next(error);
    }
  }
});

router.get('/image', async (req, res, next) => {
  try {
    const { date, imageName, color = 'natural' } = req.query;
    
    if (!date || !imageName) {
      return res.status(400).json({ error: 'Both date and imageName parameters are required' });
    }
    
    if (!['natural', 'enhanced'].includes(color)) {
      return res.status(400).json({ error: 'Color parameter must be either "natural" or "enhanced"' });
    }
    
    const [year, month, day] = date.split('-');
    const imageUrl = `https://api.nasa.gov/EPIC/archive/${color}/${year}/${month}/${day}/png/${imageName}.png?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`;
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('EPIC API error:', error.message);
    next(error);
  }
});

module.exports = router;
