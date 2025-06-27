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
    const { 
      rover = 'curiosity',
      sol,
      earth_date,
      camera,
      page = 1
    } = req.query;
    
    if (sol && earth_date) {
      return res.status(400).json({ 
        error: 'Please provide either sol OR earth_date, not both' 
      });
    }
    
    const params = { page };
    
    if (sol) {
      params.sol = sol;
    } else if (earth_date) {
      params.earth_date = earth_date;
    } else {
      params.sol = 1000;
    }
    
    if (camera) {
      params.camera = camera;
    }
    
    const data = await fetchNasaData(`mars-photos/api/v1/rovers/${rover}/photos`, params);
    res.json(data);
  } catch (error) {
    console.error('Mars Rover API error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Error fetching Mars Rover data' 
      });
    } else {
      next(error);
    }
  }
});

router.get('/earth_date/:date', async (req, res, next) => {
  try {
    const { rover = 'curiosity' } = req.query;
    const data = await fetchNasaData(`mars-photos/api/v1/rovers/${rover}/photos`, { 
      earth_date: req.params.date 
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/rovers', async (req, res, next) => {
  try {
    const data = await fetchNasaData('mars-photos/api/v1/rovers');
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/manifest/:rover', async (req, res, next) => {
  try {
    const { rover } = req.params;
    const data = await fetchNasaData(`mars-photos/api/v1/manifests/${rover}`);
    res.json(data);
  } catch (error) {
    console.error('Mars Rover Manifest API error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ 
        error: error.response.data.error || 'Error fetching Mars Rover manifest' 
      });
    } else {
      next(error);
    }
  }
});

module.exports = router;
