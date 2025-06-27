const express = require('express');
const axios = require('axios');
const router = express.Router();

const NASA_IMAGES_API_URL = 'https://images-api.nasa.gov';

router.get('/search', async (req, res) => {
  try {
    const { q, media_type, year_start, year_end, page } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    const params = { q };
    
    if (media_type) params.media_type = media_type;
    if (year_start) params.year_start = year_start;
    if (year_end) params.year_end = year_end;
    if (page) params.page = page;
    
    const response = await axios.get(`${NASA_IMAGES_API_URL}/search`, { params });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NASA image search results:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch NASA image search results',
      details: error.response?.data || error.message
    });
  }
});

router.get('/asset/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }
    
    const response = await axios.get(`${NASA_IMAGES_API_URL}/asset/${nasa_id}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NASA asset manifest:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch NASA asset manifest',
      details: error.response?.data || error.message
    });
  }
});


router.get('/metadata/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }
    
    const response = await axios.get(`${NASA_IMAGES_API_URL}/metadata/${nasa_id}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NASA metadata:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch NASA metadata',
      details: error.response?.data || error.message
    });
  }
});


router.get('/captions/:nasa_id', async (req, res) => {
  try {
    const { nasa_id } = req.params;
    
    if (!nasa_id) {
      return res.status(400).json({ error: 'NASA ID is required' });
    }
    
    const response = await axios.get(`${NASA_IMAGES_API_URL}/captions/${nasa_id}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching NASA captions:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch NASA captions',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
