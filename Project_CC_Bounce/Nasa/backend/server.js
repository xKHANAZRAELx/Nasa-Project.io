const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const apodRouter = require('./routes/apod');
app.use('/api/apod', apodRouter);

const marsRoverRouter = require('./routes/mars-rover');
app.use('/api/mars-rover', marsRoverRouter);

const epicRouter = require('./routes/epic');
app.use('/api/epic', epicRouter);

const imagesRouter = require('./routes/images');
app.use('/api/images', imagesRouter);

const neoWsRouter = require('./routes/neows');
app.use('/api/neo', neoWsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
