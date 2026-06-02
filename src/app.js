import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import initSocket from './socket/index.js';

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'TaskTic backend is running' });
});

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
