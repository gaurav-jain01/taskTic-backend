const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const routes = require('./routes');
app.use('/api', routes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasktic';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.json({ message: 'TaskTic backend is running' });
});

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
require('./socket')(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
